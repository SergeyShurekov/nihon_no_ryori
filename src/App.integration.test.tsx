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
    renderAppAt("/recipe/miso-soup");

    expect(
      await screen.findByRole("heading", { name: "Мисо-суп с тофу и вакамэ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Похожие рецепты" })).toBeInTheDocument();
  });

  it("filters recipes by search and pantry ingredients", async () => {
    const user = userEvent.setup();
    renderAppAt("/");

    await user.type(screen.getByPlaceholderText("Найти рецепт..."), "мисо");

    expect(screen.getByRole("heading", { name: "Мисо-суп с тофу и вакамэ" })).toBeInTheDocument();
    expect(screen.queryByText("Рецепты не найдены")).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText("Найти рецепт..."));
    await user.type(
      screen.getByPlaceholderText("Например: креветки, тыква, яйцо, мука"),
      "рис, нори",
    );

    expect(
      await screen.findByRole("heading", { name: "Полных совпадений по имеющимся продуктам пока нет" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Почти подходит" })).toBeInTheDocument();
    });

    expect(screen.getAllByText("Не хватает").length).toBeGreaterThan(0);
  });
});
