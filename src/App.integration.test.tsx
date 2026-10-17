import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const renderAppAt = (path: string, language: "ja" | "ru" = "ru") => {
  window.localStorage.clear();
  window.localStorage.setItem("nihon-no-ryori-language", language);
  window.history.pushState({}, "", path);

  return render(<App />);
};

describe("App integration", () => {
  it("renders the recipe detail page for a route", async () => {
    renderAppAt("/recipe/baklazhany-v-miso-s-svinym-farshem");

    expect(
      await screen.findByRole("heading", { name: "Баклажаны в мисо с свиным фаршем" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Похожие рецепты" })).toBeInTheDocument();
  });

  it("filters recipes by search and pantry ingredients", async () => {
    const user = userEvent.setup();
    renderAppAt("/");

    await user.type(screen.getByPlaceholderText("Найти рецепт..."), "мисо");

    expect(
      screen.getAllByRole("heading", { name: "Баклажаны в мисо с свиным фаршем" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Рецепты не найдены")).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Найти рецепт..."));
    await user.type(
      screen.getByPlaceholderText("Например: креветки, тыква, яйцо, мука"),
      "рис, нори",
    );

    expect(
      await screen.findByRole("heading", { name: "Можно приготовить уже сейчас" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Почти подходит" })).toBeInTheDocument();
    });

    expect(screen.getAllByText("Не хватает").length).toBeGreaterThan(0);
  });
});
