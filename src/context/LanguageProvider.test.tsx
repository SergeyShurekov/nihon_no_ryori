import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageProvider from "./LanguageProvider";
import { getInitialLanguage } from "./languageStorage";
import { useLanguage } from "./useLanguage";

const originalNavigatorLanguage = window.navigator.language;

const setNavigatorLanguage = (value: string) => {
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    value,
  });
};

const LanguageProbe = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div>
      <span>{language}</span>
      <button type="button" onClick={() => setLanguage("ru")}>
        switch-ru
      </button>
    </div>
  );
};

describe("LanguageProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setNavigatorLanguage(originalNavigatorLanguage);
  });

  it("detects browser language on the first launch", () => {
    setNavigatorLanguage("ru-RU");

    expect(getInitialLanguage()).toBe("ru");
  });

  it("persists manual language changes", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>,
    );

    expect(screen.getByText("ja")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "switch-ru" }));

    expect(screen.getByText("ru")).toBeInTheDocument();
    expect(window.localStorage.getItem("nihon-no-ryori-language")).toBe("ru");
  });
});
