/**
 * Tests for Home page component
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { render } from "../test/test-utils";
import userEvent from "@testing-library/user-event";
import { Home } from "./Home";

describe("Home", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("should render the title", () => {
    const { getByText } = render(<Home />);
    expect(getByText(/GrokForge AI Hub/i)).toBeInTheDocument();
  });

  it("should render all demo cards", () => {
    const { getAllByText } = render(<Home />);
    // Should render 9 demo cards
    const cards = getAllByText(/Demo \d/i);
    expect(cards.length).toBeGreaterThanOrEqual(9);
  });

  it("should display total demos count", () => {
    const { getByText } = render(<Home />);
    // Check for total demos text (either Chinese or English)
    expect(
      getByText(/总演示数|Total Demos/i)
    ).toBeInTheDocument();
  });

  it("should toggle language when language button is clicked", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Home />);
    
    // Find language toggle button
    const langButton = getByRole("button", { name: /EN|中文/i });
    expect(langButton).toBeInTheDocument();
    
    // Click to toggle language
    await user.click(langButton);
    
    // Language should be saved to localStorage
    const savedLang = localStorage.getItem("home-language");
    expect(savedLang).toBeTruthy();
  });

  it("should load language from localStorage on mount", () => {
    localStorage.setItem("home-language", "en");
    const { getByRole } = render(<Home />);
    
    // Should show Chinese toggle button when language is English
    const langButton = getByRole("button", { name: /中文/i });
    expect(langButton).toBeInTheDocument();
  });

  it("should navigate to demo when demo card is clicked", async () => {
    const user = userEvent.setup();
    const { getAllByText } = render(<Home />);
    
    // Find first demo card (Demo 1)
    const demoCards = getAllByText(/Demo 1|图标库|Icon/i);
    if (demoCards.length > 0) {
      const demoCard = demoCards[0].closest("div[class*='Card']") || demoCards[0].parentElement;
      if (demoCard) {
        await user.click(demoCard as HTMLElement);
        // Check that location was updated
        expect(window.location.href).toBe("/demo1");
      }
    }
  });

  it("should show featured badge for featured demos", () => {
    const { getAllByText } = render(<Home />);
    // Demo 6 is featured
    const featuredBadges = getAllByText(/特色|Featured/i);
    expect(featuredBadges.length).toBeGreaterThan(0);
  });

  it("should render view demo buttons", () => {
    const { getAllByText } = render(<Home />);
    const viewButtons = getAllByText(/查看演示|View Demo/i);
    expect(viewButtons.length).toBeGreaterThanOrEqual(9);
  });
});

