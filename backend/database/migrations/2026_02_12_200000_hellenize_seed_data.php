<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * SEED-DATA-FIX: Update existing English seed data to Greek.
 *
 * This migration updates producer names, descriptions, and product names/descriptions
 * from English placeholders to proper Greek text so the marketplace looks authentic.
 *
 * Safe to run multiple times — uses slug-based lookups.
 */
return new class extends Migration
{
    public function up(): void
    {
        // --- Producers ---

        DB::table('producers')->where('slug', 'green-farm-co')->update([
            'name' => 'Κτήμα Παπαδόπουλου',
            'slug' => 'ktima-papadopoulou',
            'business_name' => 'Κτήμα Παπαδόπουλου Ο.Ε.',
            'description' => 'Βιολογικά λαχανικά και φρούτα από οικογενειακό αγρόκτημα στη Μεσσηνία. Καλλιεργούμε με σεβασμό στη γη από το 1985.',
            'location' => 'Καλαμάτα, Μεσσηνία',
            'updated_at' => now(),
        ]);

        DB::table('producers')->where('slug', 'cretan-honey')->update([
            'name' => 'Μελισσοκομία Κρήτης',
            'slug' => 'melissokomia-kritis',
            'business_name' => 'Μελισσοκομία Κρήτης — Στεφανάκης',
            'description' => 'Παραδοσιακή μελισσοκομία τρίτης γενιάς στα βουνά της Κρήτης. Θυμαρίσιο μέλι, ελαιόλαδο και προϊόντα κυψέλης.',
            'location' => 'Ηράκλειο, Κρήτη',
            'updated_at' => now(),
        ]);

        DB::table('producers')->where('slug', 'mount-olympus-dairy')->update([
            'name' => 'Γαλακτοκομικά Ολύμπου',
            'slug' => 'galaktokomika-olympou',
            'business_name' => 'Γαλακτοκομικά Ολύμπου Α.Ε.',
            'description' => 'Παραδοσιακά γαλακτοκομικά προϊόντα από τους πρόποδες του Ολύμπου. Φέτα ΠΟΠ, γιαούρτι και τυριά με γάλα ελευθέρας βοσκής.',
            'location' => 'Λάρισα, Θεσσαλία',
            'updated_at' => now(),
        ]);

        // GreekProductSeeder producers (if they exist)
        DB::table('producers')->where('slug', 'malis-garden')->update([
            'name' => 'Κήπος Μάλη',
            'business_name' => 'Κήπος Μάλη',
            'description' => 'Παραδοσιακό βιολογικό αγρόκτημα με ελαιόλαδο και κονσέρβες στην Αττική.',
            'location' => 'Αττική',
            'updated_at' => now(),
        ]);

        DB::table('producers')->where('slug', 'lemnos-honey-co')->update([
            'name' => 'Μελισσοκομία Λήμνου',
            'business_name' => 'Μελισσοκομία Λήμνου',
            'description' => 'Οικογενειακή μελισσοκομία τρίτης γενιάς με premium θυμαρίσιο μέλι από τη Λήμνο.',
            'location' => 'Λήμνος',
            'updated_at' => now(),
        ]);

        // --- Products (main seeder products) ---

        DB::table('products')->where('slug', 'organic-tomatoes')->update([
            'name' => 'Ντομάτες Βιολογικές',
            'slug' => 'ntomates-viologikes',
            'description' => 'Φρέσκες βιολογικές ντομάτες από το κτήμα μας στη Μεσσηνία. Καλλιεργούνται χωρίς φυτοφάρμακα με παραδοσιακές μεθόδους.',
            'unit' => 'kg',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'fresh-lettuce')->update([
            'name' => 'Μαρούλι Φρέσκο',
            'slug' => 'marouli-fresko',
            'description' => 'Τραγανό φρέσκο μαρούλι, ιδανικό για σαλάτες. Μαζεύεται κάθε πρωί από τον κήπο μας.',
            'unit' => 'τεμάχιο',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'greek-oregano')->update([
            'name' => 'Ρίγανη Βουνού 100g',
            'slug' => 'rigani-vounou-100g',
            'description' => 'Αρωματική ελληνική ρίγανη βουνού, αποξηραμένη με τον παραδοσιακό τρόπο. Ιδανική για σαλάτες και ψητά.',
            'unit' => 'συσκευασία',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'extra-virgin-olive-oil')->update([
            'name' => 'Εξαιρετικό Παρθένο Ελαιόλαδο 500ml',
            'slug' => 'exairetiko-partheno-elaiolado-500ml',
            'description' => 'Premium ελαιόλαδο εξαιρετικό παρθένο από βιολογικούς ελαιώνες της Κρήτης. Χαμηλή οξύτητα, πλούσια γεύση.',
            'unit' => 'φιάλη',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'cretan-thyme-honey')->update([
            'name' => 'Θυμαρίσιο Μέλι Κρήτης 450g',
            'slug' => 'thymarisio-meli-kritis-450g',
            'description' => 'Αγνό θυμαρίσιο μέλι από τα βουνά της Κρήτης. Συλλέγεται χειροποίητα από τα μελίσσια μας σε υψόμετρο 800μ.',
            'unit' => 'βάζο',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'fresh-apples')->update([
            'name' => 'Μήλα Ζαγοράς Πηλίου',
            'slug' => 'mila-zagoras-piliou',
            'description' => 'Τραγανά μήλα ΠΟΠ Ζαγοράς Πηλίου. Φυσική γλυκύτητα και τραγανή υφή, ιδανικά για κατανάλωση και μαγειρική.',
            'unit' => 'kg',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'greek-feta-cheese')->update([
            'name' => 'Φέτα ΠΟΠ Θεσσαλίας 400g',
            'slug' => 'feta-pop-thessalias-400g',
            'description' => 'Αυθεντική φέτα ΠΟΠ από γάλα ελευθέρας βοσκής στους πρόποδες του Ολύμπου. Κρεμώδης υφή, πλούσια γεύση.',
            'unit' => 'συσκευασία',
            'updated_at' => now(),
        ]);

        // --- GreekProductSeeder products (update descriptions to Greek) ---

        DB::table('products')->where('slug', 'exairetiko-partheno-elaiolado-1l')->update([
            'description' => 'Εξαιρετικό παρθένο ελαιόλαδο από βιολογικές ελιές της Αττικής. Χαμηλή οξύτητα, πλούσιο άρωμα.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'glyko-koutaliou-syko-380g')->update([
            'description' => 'Παραδοσιακό γλυκό κουταλιού σύκο, φτιαγμένο με τον παλιό τρόπο από φρέσκα σύκα.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'feta-pop-mytilinis')->update([
            'description' => 'Αυθεντική φέτα ΠΟΠ Μυτιλήνης από γάλα ελευθέρας βοσκής. Κρεμώδης και αρωματική.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'portokalia-viologika')->update([
            'description' => 'Βιολογικά πορτοκάλια Αργολίδας, γεμάτα χυμό. Ιδανικά για φρέσκο χυμό και κατανάλωση.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'patates-naxou')->update([
            'description' => 'Οι φημισμένες πατάτες Νάξου ΠΓΕ. Τραγανές, αρωματικές, ιδανικές για τηγάνισμα και φούρνο.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'trachanas-spitikos')->update([
            'description' => 'Σπιτικός τραχανάς φτιαγμένος με παραδοσιακή συνταγή από ξινόγαλο και σιτάρι.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'thymarisio-meli-450g')->update([
            'description' => 'Premium θυμαρίσιο μέλι από τη Λήμνο. Πυκνό, αρωματικό, με χαρακτηριστική χρυσή απόχρωση.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'tsipouro-paradosiako')->update([
            'description' => 'Παραδοσιακό τσίπουρο χωρίς γλυκάνισο, απόσταξη σε χάλκινο καζάνι. Ήπια γεύση, καθαρό άρωμα.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'rigani-vounou')->update([
            'description' => 'Άγρια ρίγανη βουνού από την Ήπειρο. Αρωματική, ξηραμένη στον ήλιο με τον παραδοσιακό τρόπο.',
            'updated_at' => now(),
        ]);

        DB::table('products')->where('slug', 'krasi-limnou-erythro')->update([
            'description' => 'Ερυθρό κρασί από τους αμπελώνες της Λήμνου. Ξηρό, με νότες μαύρων φρούτων και μπαχαρικών.',
            'updated_at' => now(),
        ]);

        // --- Categories (update names to Greek) ---

        $categoryUpdates = [
            'fruits' => 'Φρούτα',
            'vegetables' => 'Λαχανικά',
            'herbs-spices' => 'Βότανα & Μπαχαρικά',
            'grains-cereals' => 'Δημητριακά & Όσπρια',
            'dairy-products' => 'Γαλακτοκομικά',
            'olive-oil-olives' => 'Ελαιόλαδο & Ελιές',
            'wine-beverages' => 'Κρασιά & Ποτά',
            'honey-preserves' => 'Μέλι & Κονσέρβες',
            'legumes' => 'Όσπρια',
            'pasta-trahanas' => 'Ζυμαρικά & Τραχανάς',
            'flours-bakery' => 'Αλεύρια & Αρτοποιία',
            'nuts-dried-fruits' => 'Ξηροί Καρποί',
            'sweets-preserves' => 'Γλυκά & Μαρμελάδες',
            'sauces-pickles' => 'Σάλτσες & Τουρσιά',
        ];

        foreach ($categoryUpdates as $slug => $greekName) {
            DB::table('categories')->where('slug', $slug)->update([
                'name' => $greekName,
                'updated_at' => now(),
            ]);
        }

        // --- User names for producer accounts ---

        DB::table('users')->where('email', 'producer2@example.com')->update([
            'name' => 'Νίκος Στεφανάκης',
            'updated_at' => now(),
        ]);

        DB::table('users')->where('email', 'producer3@example.com')->update([
            'name' => 'Γιώργος Τσιμπούκης',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Reversing this migration is not practical — seed data should
        // be re-created with `php artisan migrate:fresh --seed` if needed.
    }
};
