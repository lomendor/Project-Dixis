"use client";
import React from "react";

/**
 * Minimal shim to satisfy type-check during integration.
 * All props are optional to avoid breaking contracts; render is inert.
 * Replace with the real implementation in a follow-up polish PR if needed.
 */
export type HomeClientProps = {
    children?: React.ReactNode;
    initialProducts?: unknown;
    user?: unknown;
    // add other optional props here if page.tsx passes any
};

export default function HomeClient(props: HomeClientProps) {
    // Do not change UI semantics: shallow wrapper only.
    return <div data-testid="home-client">{props.children ?? null}</div>;
}
