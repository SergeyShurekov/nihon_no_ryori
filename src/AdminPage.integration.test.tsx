import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "./App";

describe("Admin page integration", () => {
  it("adds a custom recipe through the admin form", async () => {
    const user = userEvent.setup();

    window.localStorage.clear();
    window.localStorage.setItem("nihon-no-ryori-language", "ru");
    window.history.pushState({}, "", "/admin");

    render(<App />);

    await user.type(screen.getByLabelText("Название (русский)"), "Домашний донбури");
    await user.type(screen.getByLabelText("Название (японский)"), "家庭の丼");
    await user.type(
      screen.getByLabelText("Описание (русский)"),
      "Простой рисовый донбури для домашнего ужина.",
    );
    await user.type(
      screen.getByLabelText("Описание (японский)"),
      "家庭で作りやすい丼料理です。",
    );
    await user.type(screen.getByLabelText("Сложность (русский)"), "Лёгкая");
    await user.type(screen.getByLabelText("Сложность (японский)"), "初級");
    await user.type(screen.getByLabelText("Регион (русский)"), "Токио");
    await user.type(screen.getByLabelText("Регион (японский)"), "東京");
    await user.type(screen.getByLabelText("Сезон (русский)"), "Круглый год");
    await user.type(screen.getByLabelText("Сезон (японский)"), "通年");
    await user.type(screen.getByLabelText("Теги (русский)"), "рис\nужин");
    await user.type(screen.getByLabelText("Теги (японский)"), "ご飯\n夕食");
    await user.type(screen.getByLabelText("Ингредиенты дома (русский)"), "рис\nяйцо");
    await user.type(screen.getByLabelText("Ингредиенты дома (японский)"), "ご飯\n卵");
    await user.type(screen.getByLabelText("Ингредиенты (русский)"), "Рис 200 г\nЯйцо 2 шт.");
    await user.type(screen.getByLabelText("Ингредиенты (японский)"), "ご飯 200g\n卵 2個");
    await user.type(screen.getByLabelText("Шаги (русский)"), "Сварить рис\nПодать с яйцом");
    await user.type(screen.getByLabelText("Шаги (японский)"), "ご飯を炊く\n卵をのせる");

    await user.click(screen.getByRole("button", { name: "Сохранить рецепт" }));

    expect(await screen.findByText("Рецепт сохранён.")).toBeInTheDocument();
    expect(screen.getByText("Домашний донбури")).toBeInTheDocument();
  });

  it("shows validation errors when required fields are missing", async () => {
    const user = userEvent.setup();

    window.localStorage.clear();
    window.localStorage.setItem("nihon-no-ryori-language", "ru");
    window.history.pushState({}, "", "/admin");

    render(<App />);

    await user.clear(screen.getByLabelText("Время приготовления"));
    await user.clear(screen.getByLabelText("Базовое число порций"));
    await user.clear(screen.getByLabelText("Ориентировочная стоимость"));
    await user.click(screen.getByRole("button", { name: "Сохранить рецепт" }));

    expect(await screen.findByText("Проверьте обязательные поля формы.")).toBeInTheDocument();
    expect(screen.getByLabelText("Название (русский)")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Время приготовления")).toHaveAttribute("aria-invalid", "true");
  });

  it("edits and deletes a custom recipe", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm");

    window.localStorage.clear();
    window.localStorage.setItem("nihon-no-ryori-language", "ru");
    window.history.pushState({}, "", "/admin");

    render(<App />);

    await user.type(screen.getByLabelText("Название (русский)"), "Тестовый суп");
    await user.type(screen.getByLabelText("Название (японский)"), "テストスープ");
    await user.type(screen.getByLabelText("Описание (русский)"), "Описание супа.");
    await user.type(screen.getByLabelText("Описание (японский)"), "スープの説明。");
    await user.type(screen.getByLabelText("Сложность (русский)"), "Лёгкая");
    await user.type(screen.getByLabelText("Сложность (японский)"), "初級");
    await user.type(screen.getByLabelText("Регион (русский)"), "Осака");
    await user.type(screen.getByLabelText("Регион (японский)"), "大阪");
    await user.type(screen.getByLabelText("Сезон (русский)"), "Зима");
    await user.type(screen.getByLabelText("Сезон (японский)"), "冬");
    await user.type(screen.getByLabelText("Теги (русский)"), "суп");
    await user.type(screen.getByLabelText("Теги (японский)"), "スープ");
    await user.type(screen.getByLabelText("Ингредиенты дома (русский)"), "вода");
    await user.type(screen.getByLabelText("Ингредиенты дома (японский)"), "水");
    await user.type(screen.getByLabelText("Ингредиенты (русский)"), "Вода 500 мл");
    await user.type(screen.getByLabelText("Ингредиенты (японский)"), "水 500ml");
    await user.type(screen.getByLabelText("Шаги (русский)"), "Подогреть");
    await user.type(screen.getByLabelText("Шаги (японский)"), "温める");
    await user.click(screen.getByRole("button", { name: "Сохранить рецепт" }));

    await user.click(screen.getByRole("button", { name: "Редактировать" }));

    const titleField = screen.getByLabelText("Название (русский)");
    await user.clear(titleField);
    await user.type(titleField, "Обновлённый тестовый суп");
    await user.click(screen.getByRole("button", { name: "Сохранить изменения" }));

    expect(await screen.findByText("Рецепт обновлён.")).toBeInTheDocument();
    expect(screen.getByText("Обновлённый тестовый суп")).toBeInTheDocument();

    confirmSpy.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Удалить" }));
    expect(confirmSpy).toHaveBeenCalledWith(
      "Удалить рецепт «Обновлённый тестовый суп»? Это действие нельзя отменить.",
    );
    expect(screen.getByText("Обновлённый тестовый суп")).toBeInTheDocument();

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Удалить" }));
    expect(await screen.findByText("Рецепт удалён.")).toBeInTheDocument();
    expect(screen.queryByText("Обновлённый тестовый суп")).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});
