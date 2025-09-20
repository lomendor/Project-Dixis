type NetworkLogEntry = { [k: string]: any };
import { test, expect, Page } from "@playwright/test";

class PRevidenceCollector {
    private networkLogs: Array<{
        url: string;
        method: string;
        request?: any;
        response?: any;
        timestamp: string;
    }> = [];

    constructor(private page: Page) {
        this.setupNetworkLogging();
    }

    private setupNetworkLogging() {
        // Capture all network requests/responses
        this.page.on("request", (request) => {
            const log = {
                url: request.url(),
                method: request.method(),
                timestamp: new Date().toISOString(),
            };

            // Capture shipping API requests
            if (request.url().includes("/api/v1/shipping/quote")) {
                try {
                    (log as any).request = JSON.parse(request.postData() || "{}");
                    console.log(
                        "🌐 Shipping API Request:",
                        JSON.stringify(log, null, 2),
                    );
                } catch (e) {
                    console.log(
                        "🌐 Shipping API Request (raw):",
                        request.postData(),
                    );
                }
            }

            this.networkLogs.push(log);
        });

        this.page.on("response", async (response) => {
            const logIndex = this.networkLogs.findIndex(
                (log) => log.url === response.url() && !log.response,
            );

            if (logIndex !== -1) {
                try {
                    // Capture shipping API responses
                    if (response.url().includes("/api/v1/shipping/quote")) {
                        const responseBody = await response.json();
                        this.networkLogs[logIndex].response = responseBody;
                        console.log(
                            "🌐 Shipping API Response:",
                            JSON.stringify(responseBody, null, 2),
                        );

                        // Take screenshot when shipping response arrives
                        await this.captureScreenshot(
                            "shipping-api-response",
                            true,
                        );
                    }

                    // Capture order creation responses
                    if (
                        response.url().includes("/api/v1/orders") &&
                        response?.request().method() === "POST"
                    ) {
                        const orderResponse = await response.json();
                        this.networkLogs[logIndex].response = orderResponse;
                        console.log(
                            "🛒 Order Creation Response:",
                            JSON.stringify(orderResponse, null, 2),
                        );
                    }
                } catch (e) {
                    // Response not JSON or couldn't parse
                }
            }
        });
    }

    async captureScreenshot(name: string, includeTimestamp = false) {
        const timestamp = includeTimestamp
            ? `-${new Date().toISOString().replace(/[:.]/g, "-")}`
            : "";
        const filename = `pr-evidence-${name}${timestamp}.png`;
        await this.page.screenshot({
            path: `test-results/${filename}`,
            fullPage: true,
        });
        console.log(`📸 Evidence captured: ${filename}`);
        return filename;
    }

    async loginAsConsumer() {
        console.log("🔐 Logging in as consumer...");

        await this.page.goto("/");
        await this.page.waitForLoadState("networkidle");

        // Navigate to login
        await this.page.getByRole("link", { name: /login/i }).first().click();
        await expect(this.page).toHaveURL(/\/auth\/login/);

        // Login with consumer credentials
        await this.page.fill('[name="email"]', "consumer@example.com");
        await this.page.fill('[name="password"]', "password");

        await Promise.all([
            this.page.waitForURL("/", { timeout: 10000 }),
            this.page.click('button[type="submit"]'),
        ]);

        await this.captureScreenshot("01-login-success");
        console.log("✅ Login successful");
    }

    async addProductToCart() {
        console.log("🛒 Adding product to cart...");

        // Wait for products to load on homepage
        await this.page.waitForSelector('[data-testid="product-card"]', {
            timeout: 15000,
        });

        // Click on first product
        const firstProduct = this.page
            .locator('[data-testid="product-card"]')
            .first();
        await firstProduct.locator("a").first().click();
        await expect(this.page).toHaveURL(/\/products\/\d+/);

        await this.captureScreenshot("02-product-page");

        // Add to cart
        const addToCartBtn = this.page.locator(
            '[data-testid="add-to-cart"], button:has-text("Add to Cart")',
        );
        await expect(addToCartBtn).toBeVisible();
        await addToCartBtn.click();

        // Wait for add to cart confirmation
        await this.page.waitForTimeout(1000);

        console.log("✅ Product added to cart");
    }

    async navigateToCartAndCaptureInitialState() {
        console.log("🛒 Navigating to cart page...");

        await this.page.goto("/cart");
        await this.page.waitForLoadState("networkidle");
        await expect(this.page).toHaveURL(/\/cart/);

        // Wait a moment for cart to fully load
        await this.page.waitForTimeout(2000);

        await this.captureScreenshot("03-cart-initial-state");

        // Verify cart has items
        const cartItems = this.page.locator('[data-testid="cart-item"]');
        await expect(cartItems.first()).toBeVisible();

        console.log("✅ Cart loaded with items");
    }

    async testShippingCostCalculation() {
        console.log("💰 Testing shipping cost calculation...");

        // Find shipping input fields
        const postalField = this.page
            .locator(
                '[data-testid="postal-code-input"], input[name="postal_code"], input[placeholder*="ΤΚ"]',
            )
            .first();
        const cityField = this.page
            .locator(
                '[data-testid="city-input"], input[name="city"], input[placeholder*="city"]',
            )
            .first();

        await expect(postalField).toBeVisible();
        await expect(cityField).toBeVisible();

        // Test 1: Athens (Metro Zone)
        await postalField.clear();
        await postalField.fill("11527");
        await this.captureScreenshot("04-postal-entered-athens");

        await cityField.clear();
        await cityField.fill("Athens");
        await this.captureScreenshot("05-city-entered-athens");

        // Wait for shipping API call and response
        await this.page.waitForTimeout(2000);
        await this.captureScreenshot("06-shipping-calculated-athens");

        // Verify Athens Express shipping appears
        await expect(this.page.locator("text=Athens Express")).toBeVisible({
            timeout: 10000,
        });
        await expect(this.page.locator("text=€4.20")).toBeVisible();
        await expect(this.page.locator("text=1 day")).toBeVisible();

        console.log("✅ Athens shipping calculated correctly");

        // Test 2: Invalid postal code (error state)
        await postalField.clear();
        await postalField.fill("123"); // Too short
        await this.captureScreenshot("07-invalid-postal-code");

        // Should show validation error
        const checkoutBtn = this.page.locator('[data-testid="checkout-btn"]');
        await expect(checkoutBtn).toBeDisabled();
        await expect(checkoutBtn).toHaveText(/Enter valid ΤΚ/);

        console.log("✅ Invalid postal code validation working");

        // Test 3: Different shipping zone (Thessaloniki)
        await postalField.clear();
        await postalField.fill("54623");
        await cityField.clear();
        await cityField.fill("Thessaloniki");
        await this.captureScreenshot("08-thessaloniki-shipping");

        await this.page.waitForTimeout(2000);
        await expect(this.page.locator("text=Northern Courier")).toBeVisible({
            timeout: 10000,
        });
        await expect(this.page.locator("text=2 day")).toBeVisible();

        console.log("✅ Thessaloniki shipping calculated correctly");

        // Reset to Athens for checkout
        await postalField.clear();
        await postalField.fill("11527");
        await cityField.clear();
        await cityField.fill("Athens");
        await this.page.waitForTimeout(2000);

        await this.captureScreenshot("09-final-shipping-state");
    }

    async verifyTotalRecalculation() {
        console.log("💰 Verifying total recalculation...");

        // Look for total amounts
        const totalElements = this.page.locator(
            '[data-testid="total"], .total, text=/Total.*€/',
        );
        const shippingElements = this.page.locator(
            '[data-testid="shipping-cost"], text=/Shipping.*€/',
        );

        // Capture current totals
        const totalCount = await totalElements.count();
        const shippingCount = await shippingElements.count();

        console.log(
            `Found ${totalCount} total elements, ${shippingCount} shipping elements`,
        );

        if (totalCount > 0) {
            for (let i = 0; i < totalCount; i++) {
                const totalText = await totalElements.nth(i).textContent();
                console.log(`Total ${i + 1}: "${totalText}"`);
            }
        }

        if (shippingCount > 0) {
            for (let i = 0; i < shippingCount; i++) {
                const shippingText = await shippingElements
                    .nth(i)
                    .textContent();
                console.log(`Shipping ${i + 1}: "${shippingText}"`);
            }
        }

        await this.captureScreenshot("10-totals-verification");
    }

    async proceedToCheckout() {
        console.log("🛒 Proceeding to checkout...");

        // Ensure checkout button is enabled
        const checkoutBtn = this.page.locator('[data-testid="checkout-btn"]');
        await expect(checkoutBtn).toBeEnabled();
        await expect(checkoutBtn).toHaveText("Proceed to Checkout");

        await this.captureScreenshot("11-before-checkout");

        // Click checkout
        await checkoutBtn.click();

        // Wait for order creation (this triggers POST /api/v1/orders)
        await this.page.waitForURL(/\/orders\/\d+/, { timeout: 15000 });

        await this.captureScreenshot("12-order-confirmation");

        // Verify order confirmation page
        expect(this.page.url()).toMatch(/\/orders\/\d+$/);

        console.log("✅ Order created and confirmation page loaded");
    }

    async verifyOrderDetails() {
        console.log("📋 Verifying order details...");

        // Extract order ID from URL
        const orderIdMatch = this.page.url().match(/\/orders\/(\d+)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : "unknown";

        console.log(`Order ID: ${orderId}`);

        // Verify shipping details are shown
        await expect(this.page.locator("text=Athens Express")).toBeVisible();
        await expect(this.page.locator("text=1 day")).toBeVisible();
        await expect(this.page.locator("text=Athens")).toBeVisible();
        await expect(this.page.locator("text=11527")).toBeVisible();

        // Verify order success message
        await expect(
            this.page.locator(
                '[data-testid="order-success"], text=/Order.*successful/i',
            ),
        ).toBeVisible();

        await this.captureScreenshot("13-order-details-final");

        console.log("✅ Order details verified with shipping information");
    }

    generateEvidenceReport() {
        console.log("\n" + "=".repeat(60));
        console.log("📊 PR EVIDENCE COLLECTION REPORT");
        console.log("=".repeat(60));

        // Network activity summary
        const shippingRequests = this.networkLogs.filter((log) =>
            log.url.includes("/api/v1/shipping/quote"),
        );

        const orderRequests = this.networkLogs.filter(
            (log) =>
                log.url.includes("/api/v1/orders") && log.method === "POST",
        );

        console.log("\n🌐 NETWORK ACTIVITY SUMMARY:");
        console.log(`• Shipping API calls: ${shippingRequests.length}`);
        console.log(`• Order creation calls: ${orderRequests.length}`);
        console.log(`• Total network requests: ${this.networkLogs.length}`);

        // Print shipping requests in detail
        if (shippingRequests.length > 0) {
            console.log("\n📦 SHIPPING API REQUESTS:");
            shippingRequests.forEach((req, index) => {
                console.log(`\n${index + 1}. POST /api/v1/shipping/quote`);
                if (req?.request) {
                    console.log(
                        "   Request payload:",
                        JSON.stringify(req?.request, null, 2),
                    );
                }
                if (req.response) {
                    console.log(
                        "   Response:",
                        JSON.stringify(req.response, null, 2),
                    );
                }
            });
        }

        // Print order requests in detail
        if (orderRequests.length > 0) {
            console.log("\n🛒 ORDER CREATION REQUESTS:");
            orderRequests.forEach((req, index) => {
                console.log(`\n${index + 1}. POST /api/v1/orders`);
                if (req?.request) {
                    console.log(
                        "   Request payload:",
                        JSON.stringify(req?.request, null, 2),
                    );
                }
                if (req.response) {
                    console.log(
                        "   Response:",
                        JSON.stringify(req.response, null, 2),
                    );

                    // Extract key order details
                    if (req.response.data) {
                        const order = req.response.data;
                        console.log(`   📋 Order ID: ${order.id}`);
                        console.log(
                            `   📍 Shipping Address: ${order.shipping_address?.city}, ${order.shipping_address?.zip}`,
                        );
                        console.log(
                            `   🚚 Shipping: ${order.shipping?.carrier} (${order.shipping?.cost}€, ${order.shipping?.eta_days} days)`,
                        );
                    }
                }
            });
        }

        console.log("\n" + "=".repeat(60));
        console.log("✅ Evidence collection completed!");
        console.log("📂 Screenshots saved in test-results/ directory");
        console.log(
            "🔍 Check the console output above for API request/response details",
        );
        console.log("=".repeat(60));
    }
}

test.describe("PR Evidence Collection - Shipping Integration", () => {
    test("PR #37 & #38: Complete shipping and checkout evidence", async ({
        page,
    }) => {
        const collector = new PRevidenceCollector(page);

        console.log("🚀 Starting comprehensive PR evidence collection...");
        console.log("🎯 Target: PR #37 (Cart/Checkout) + PR #38 (Checkout)");
        console.log(
            "📍 Servers: API http://127.0.0.1:8001 | Frontend http://localhost:3001",
        );
        console.log("");

        try {
            // Phase 1: Authentication and Setup
            await collector.loginAsConsumer();
            await collector.addProductToCart();
            await collector.navigateToCartAndCaptureInitialState();

            // Phase 2: Shipping Integration Testing (PR #37)
            await collector.testShippingCostCalculation();
            await collector.verifyTotalRecalculation();

            // Phase 3: Checkout Flow Testing (PR #38)
            await collector.proceedToCheckout();
            await collector.verifyOrderDetails();

            // Phase 4: Generate Evidence Report
            collector.generateEvidenceReport();
        } catch (error) {
            console.error("❌ Evidence collection failed:", error instanceof Error ? error.message : String(error));
            await collector.captureScreenshot("error-state");
            throw error;
        }
    });

    test("Network capture verification - shipping API only", async ({
        page,
    }) => {
        const collector = new PRevidenceCollector(page);

        console.log("🌐 Testing shipping API network capture in isolation...");

        // Quick test to isolate shipping API calls
        await collector.loginAsConsumer();
        await collector.addProductToCart();
        await collector.navigateToCartAndCaptureInitialState();

        // Make multiple shipping API calls to different zones
        const testCases = [
            { postal: "11527", city: "Athens", expected: "Athens Express" },
            {
                postal: "54623",
                city: "Thessaloniki",
                expected: "Northern Courier",
            },
            { postal: "84600", city: "Mykonos", expected: "Island Logistics" },
        ];

        for (const testCase of testCases) {
            console.log(`🧪 Testing ${testCase.city} (${testCase.postal})`);

            const postalField = page
                .locator(
                    '[data-testid="postal-code-input"], input[name="postal_code"]',
                )
                .first();
            const cityField = page
                .locator('[data-testid="city-input"], input[name="city"]')
                .first();

            await postalField.clear();
            await postalField.fill(testCase.postal);
            await cityField.clear();
            await cityField.fill(testCase.city);

            // Wait for API response
            await page.waitForTimeout(2000);

            // Verify expected carrier appears
            await expect(page.locator(`text=${testCase.expected}`)).toBeVisible(
                { timeout: 10000 },
            );

            await collector.captureScreenshot(
                `network-test-${testCase.city.toLowerCase()}`,
            );
        }

        collector.generateEvidenceReport();
    });
});
