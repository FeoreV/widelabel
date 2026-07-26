import assert from "node:assert";
import test from "node:test";
import {
  Typography,
  Button,
  Link,
  Badge,
  StatusBadge,
  Container,
  Section,
  Divider,
  LoadingSpinner,
  Skeleton,
  EmptyState,
  ErrorNotice,
  ImageWrapper,
} from "./index.js";

test("Typography export exists and renders expected variant structure", () => {
  assert.strictEqual(typeof Typography, "function");
  const comp = Typography({ variant: "headline-display", children: "WIDE LABEL ARCHIVE" });
  assert.strictEqual(comp.type, "h1");
  assert.strictEqual(comp.props.children, "WIDE LABEL ARCHIVE");
});

test("Button export exists and handles loading and disabled states", () => {
  assert.strictEqual(typeof Button, "function");
  const normalBtn = Button({ variant: "primary", children: "ADD TO CART" });
  assert.strictEqual(normalBtn.props.disabled, false);

  const disabledBtn = Button({ isDisabled: true, children: "SOLD OUT" });
  assert.strictEqual(disabledBtn.props.disabled, true);

  const loadingBtn = Button({ isLoading: true, children: "RESERVING..." });
  assert.strictEqual(loadingBtn.props.disabled, true);
  assert.strictEqual(loadingBtn.props["aria-busy"], true);
});

test("Link export exists and renders internal and external targets", () => {
  assert.strictEqual(typeof Link, "function");
  const internalLink = Link({ href: "/products", children: "CATALOG" });
  assert.strictEqual(internalLink.props.href, "/products");

  const externalLink = Link({ href: "https://instagram.com", external: true, children: "INSTAGRAM" });
  assert.strictEqual(externalLink.props.href, "https://instagram.com");
  assert.strictEqual(externalLink.props.target, "_blank");
});

test("Badge and StatusBadge export exist and render 1-of-1 concept store statuses", () => {
  assert.strictEqual(typeof Badge, "function");
  assert.strictEqual(typeof StatusBadge, "function");

  const availableBadge = StatusBadge({ status: "available" });
  assert.strictEqual(availableBadge.props.status, "available");
  assert.strictEqual(availableBadge.props.label, "1-OF-1 AVAILABLE");

  const reservedBadge = StatusBadge({ status: "reserved" });
  assert.strictEqual(reservedBadge.props.status, "reserved");

  const soldBadge = StatusBadge({ status: "sold" });
  assert.strictEqual(soldBadge.props.status, "sold");
});

test("Container and Section export exist and apply structural layout props", () => {
  assert.strictEqual(typeof Container, "function");
  assert.strictEqual(typeof Section, "function");

  const containerElem = Container({ children: "TEST CONTENT" });
  assert.strictEqual(containerElem.props.children, "TEST CONTENT");

  const sectionElem = Section({ spacing: "lg", children: "SECTION CONTENT" });
  assert.strictEqual(sectionElem.props.className.includes("wl-section-lg"), true);
});

test("Divider, LoadingSpinner, and Skeleton export exist", () => {
  assert.strictEqual(typeof Divider, "function");
  assert.strictEqual(typeof LoadingSpinner, "function");
  assert.strictEqual(typeof Skeleton, "function");

  const dividerElem = Divider({ orientation: "horizontal" });
  assert.strictEqual(dividerElem.props.role, "separator");

  const spinnerElem = LoadingSpinner({ size: "sm" });
  assert.strictEqual(spinnerElem.props["role"], "status");

  const skeletonElem = Skeleton({ variant: "rectangular", aspectRatio: "1 / 1.12" });
  assert.strictEqual(skeletonElem.props.className.includes("wl-skeleton"), true);
});

test("EmptyState, ErrorNotice, and ImageWrapper export exist and render accessible structures", () => {
  assert.strictEqual(typeof EmptyState, "function");
  assert.strictEqual(typeof ErrorNotice, "function");
  assert.strictEqual(typeof ImageWrapper, "function");

  const emptyElem = EmptyState({ title: "NO ARCHIVE PIECES" });
  assert.ok(emptyElem);

  const errorElem = ErrorNotice({ message: "FAILED TO FETCH CATALOG" });
  assert.strictEqual(errorElem.props.role, "alert");

  assert.strictEqual(typeof ImageWrapper, "function");
});
