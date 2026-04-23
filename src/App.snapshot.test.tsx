import { render } from "@testing-library/react";
import App from "./App";

const renderSnapshotAt = (path: string) => {
  window.localStorage.clear();
  window.localStorage.setItem("nihon-no-ryori-language", "ja");
  window.history.pushState({}, "", path);
  return render(<App />);
};

describe("App snapshots", () => {
  it("matches the home page snapshot", () => {
    const { asFragment } = renderSnapshotAt("/");
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches the recipe detail page snapshot", () => {
    const { asFragment } = renderSnapshotAt("/recipe/tempura");
    expect(asFragment()).toMatchSnapshot();
  });
});
