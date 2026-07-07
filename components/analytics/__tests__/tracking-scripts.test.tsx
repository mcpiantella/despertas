import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrackingScripts } from "../tracking-scripts";

describe("TrackingScripts", () => {
  it("renders nothing when no tracking ids are configured", () => {
    const { container } = render(<TrackingScripts />);

    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("renders the Meta Pixel bootstrap when a pixel id is configured", () => {
    const { container } = render(<TrackingScripts metaPixelId="123456789" />);

    const inline = [...container.querySelectorAll("script")].map(
      (node) => node.innerHTML
    );

    expect(inline.join("\n")).toContain("fbq('init', '123456789')");
    expect(inline.join("\n")).toContain("fbq('track', 'PageView')");
  });

  it("renders GA4 when a measurement id is configured", () => {
    const { container } = render(<TrackingScripts ga4Id="G-ABC123" />);

    // React 19 hoists async external scripts into document.head.
    const external = document.querySelector(
      'script[src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"]'
    );
    const inline = [...container.querySelectorAll("script")].map(
      (node) => node.innerHTML
    );

    expect(external).toBeInTheDocument();
    expect(inline.join("\n")).toContain("gtag('config', 'G-ABC123')");
  });

  it("renders GTM when a container id is configured", () => {
    const { container } = render(<TrackingScripts gtmId="GTM-XYZ99" />);

    const inline = [...container.querySelectorAll("script")].map(
      (node) => node.innerHTML
    );

    expect(inline.join("\n")).toContain("GTM-XYZ99");
  });
});
