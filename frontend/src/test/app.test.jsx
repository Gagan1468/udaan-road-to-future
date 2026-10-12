import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../app/App.jsx";
import { AuthProvider, TOKEN_KEY } from "../auth/AuthContext.jsx";
import { ThemeProvider } from "../app/ThemeContext.jsx";
import { SceneProvider } from "../app/SceneContext.jsx";
import { validate } from "../components/sections/ContactSection.jsx";
import emailjs from "@emailjs/browser";

vi.mock("@emailjs/browser", () => ({
  default: {
    send: vi.fn().mockResolvedValue({ status: 200, text: "OK" }),
  },
}));

const USER = { id: 1, name: "Asha Rao", email: "asha@example.com", created_at: "2026-01-05T10:00:00Z", has_password: true, google_linked: false, marketing_opt_in: false };
const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

function mockApi(handlers = {}) {
  const calls = [];
  vi.stubGlobal("fetch", vi.fn((url, opts = {}) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, "");
    calls.push({ path, method: opts.method || "GET", body: opts.body ? JSON.parse(opts.body) : null, auth: opts.headers?.Authorization });
    const h = handlers[`${opts.method || "GET"} ${path}`];
    return h ? h(opts) : json({ detail: "not mocked" }, 404);
  }));
  return calls;
}

function renderApp(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider><AuthProvider><SceneProvider><App /></SceneProvider></AuthProvider></ThemeProvider>
    </MemoryRouter>
  );
}

beforeEach(() => { localStorage.clear(); vi.unstubAllEnvs(); vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: "OK" }); });

describe("homepage", () => {
  it("renders every section and a footer whose links all have real destinations", async () => {
    mockApi();
    renderApp("/");
    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(primaryNav).getByRole("link", { name: "Services" })).toHaveAttribute("href", "/#services");
    expect(within(primaryNav).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/#contact");
    expect(screen.queryByRole("navigation", { name: "Homepage sections" })).not.toBeInTheDocument();
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
    for (const re of [/we provide website building, app development, and courses/i, /from complex ideas to real systems/i, /things we have built/i, /four stages/i, /what's ready/i, /learn what's next/i, /technology should move you forward/i, /have a challenge worth solving/i]) {
      expect((await screen.findAllByRole("heading", { name: re })).length).toBeGreaterThan(0);
    }
    const footer = screen.getByRole("contentinfo");
    const links = within(footer).getAllByRole("link");
    expect(links.length).toBeGreaterThan(10);
    links.forEach((a) => { const href = a.getAttribute("href"); expect(href).toBeTruthy(); expect(href).not.toBe("#"); });
  });

  it("labels concepts as concepts and never claims unavailable products are available", () => {
    mockApi(); renderApp("/");
    expect(screen.getAllByText("CONCEPT").length).toBe(2);
    const products = document.getElementById("products");
    expect(within(products).getAllByText("Available")).toHaveLength(1);       // only the real, live product
    expect(within(products).getByText("To be announced")).toBeInTheDocument(); // nothing invented
  });

  it("opens the EXISTING AuthModal from the navbar", async () => {
    mockApi(); const user = userEvent.setup(); renderApp("/");
    await user.click(screen.getAllByRole("button", { name: /^sign in$/i })[0]);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: /create your account/i })).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("mobile menu opens, traps nothing after Escape, and closes", async () => {
    mockApi(); const user = userEvent.setup(); renderApp("/");
    const toggle = screen.getByRole("button", { name: /open menu/i });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: /close menu/i, expanded: true })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("sign-in flow (shared session)", () => {
  it("email sign-in stores the token under the original key, verifies it server-side and shows the avatar", async () => {
    const calls = mockApi({
      "POST /api/auth/login": () => json({ access_token: "tok-123", token_type: "bearer", expires_in: 100 }),
      "GET /api/auth/me": () => json(USER),
    });
    const user = userEvent.setup(); renderApp("/");
    await user.click(screen.getAllByRole("button", { name: /^sign in$/i })[0]);
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /^sign in$/i }));      // switch tab
    await user.type(within(dialog).getByLabelText(/email address/i), "asha@example.com");
    await user.type(within(dialog).getByLabelText(/^password/i), "correct-horse-1");
    await user.click(within(dialog).getAllByRole("button", { name: /sign in/i }).pop());
    expect(await screen.findByRole("button", { name: /account menu for asha rao/i })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok-123");
    expect(calls.find((c) => c.path === "/api/auth/me").auth).toBe("Bearer tok-123");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("a token already in storage (from the course area) is recognised without logging in again", async () => {
    localStorage.setItem(TOKEN_KEY, "existing");
    mockApi({ "GET /api/auth/me": () => json(USER) });
    renderApp("/");
    expect(await screen.findByRole("button", { name: /account menu for asha rao/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get started/i })).not.toBeInTheDocument();
  });

  it("an expired or revoked token (401) is cleared and the visitor is signed out", async () => {
    localStorage.setItem(TOKEN_KEY, "stale");
    mockApi({ "GET /api/auth/me": () => json({ detail: "Session expired. Please sign in again." }, 401) });
    renderApp("/");
    await waitFor(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull());
    expect((await screen.findAllByRole("button", { name: /get started/i })).length).toBeGreaterThan(0);
  });

  it("a network failure does NOT log the user out", async () => {
    localStorage.setItem(TOKEN_KEY, "keep-me");
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));
    renderApp("/");
    await new Promise((r) => setTimeout(r, 50));
    expect(localStorage.getItem(TOKEN_KEY)).toBe("keep-me");
  });
});

describe("protected profile area", () => {
  it("anonymous visitors are sent to the existing sign-in modal", async () => {
    mockApi(); renderApp("/profile");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /sign in to continue/i })).toBeInTheDocument();
  });

  it("shows the real account data returned by the backend", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    mockApi({ "GET /api/auth/me": () => json(USER) });
    renderApp("/profile");
    expect(await screen.findByRole("heading", { name: "Profile", level: 2 })).toBeInTheDocument();
    expect(screen.getAllByText("asha@example.com").length).toBeGreaterThan(0);
    expect(screen.getByText("Email & password")).toBeInTheDocument();
    for (const n of ["Account", "Security", "Privacy", "Appearance", "Sessions", "Account management"]) expect(screen.getByRole("link", { name: n })).toBeInTheDocument();
  });

  it("edits the name through PATCH /api/auth/me", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    const calls = mockApi({ "GET /api/auth/me": () => json(USER), "PATCH /api/auth/me": () => json({ ...USER, name: "Asha R" }) });
    const user = userEvent.setup(); renderApp("/profile/account");
    const input = await screen.findByLabelText(/full name/i);
    await user.clear(input); await user.type(input, "Asha R");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();
    expect(calls.find((c) => c.method === "PATCH").body).toEqual({ name: "Asha R" });
  });

  it("password change validates locally, then rotates the token from the server", async () => {
    localStorage.setItem(TOKEN_KEY, "old");
    const calls = mockApi({ "GET /api/auth/me": () => json(USER), "POST /api/auth/change-password": () => json({ access_token: "rotated", token_type: "bearer", expires_in: 1 }) });
    const user = userEvent.setup(); renderApp("/profile/security");
    await user.type(await screen.findByLabelText(/current password/i), "correct-horse-1");
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass-2");
    await user.type(screen.getByLabelText(/confirm new password/i), "different-pass-9");
    await user.click(screen.getByRole("button", { name: /change password/i }));
    expect(await screen.findByText(/don't match/i)).toBeInTheDocument();
    expect(calls.some((c) => c.path === "/api/auth/change-password")).toBe(false);
    await user.clear(screen.getByLabelText(/confirm new password/i)); await user.type(screen.getByLabelText(/confirm new password/i), "brand-new-pass-2");
    await user.click(screen.getByRole("button", { name: /change password/i }));
    expect(await screen.findByText(/password updated/i)).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("rotated");
  });

  it("surfaces a server error from the backend (wrong current password)", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    mockApi({ "GET /api/auth/me": () => json(USER), "POST /api/auth/change-password": () => json({ detail: "Current password is incorrect." }, 403) });
    const user = userEvent.setup(); renderApp("/profile/security");
    await user.type(await screen.findByLabelText(/current password/i), "nope");
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-pass-2");
    await user.type(screen.getByLabelText(/confirm new password/i), "brand-new-pass-2");
    await user.click(screen.getByRole("button", { name: /change password/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/current password is incorrect/i);
  });

  it("theme preference applies to the document and persists", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    mockApi({ "GET /api/auth/me": () => json(USER) });
    const user = userEvent.setup(); renderApp("/profile/appearance");
    await user.click(await screen.findByRole("radio", { name: /light/i }));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("udaan_theme")).toBe("light");
  });

  it("account deletion needs the typed confirmation and the password", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    const calls = mockApi({ "GET /api/auth/me": () => json(USER), "POST /api/auth/delete-account": () => Promise.resolve(new Response(null, { status: 204 })) });
    const user = userEvent.setup(); renderApp("/profile/manage");
    const del = await screen.findByRole("button", { name: /delete my account/i });
    expect(del).toBeDisabled();
    await user.type(screen.getByLabelText(/your password/i), "correct-horse-1");
    await user.type(screen.getByLabelText(/type delete/i), "DELETE");
    await user.click(del);
    await waitFor(() => expect(calls.find((c) => c.path === "/api/auth/delete-account").body).toEqual({ confirm: "DELETE", password: "correct-horse-1" }));
    await waitFor(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull());
  });
});





describe("Road to Future registration confirmation", () => {
  it("keeps a saved registration successful when EmailJS delivery fails and offers the dashboard", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    const calls = mockApi({
      "GET /api/auth/me": () => json(USER),
      "GET /api/registrations/mine": () => json([]),
      "POST /api/otp/send": () => json({ ok: true }, 200),
      "POST /api/otp/verify": () => json({
        verification_token: "otp-test-token",
        phone: "+919876543210",
      }, 200),
      "POST /api/registrations": () => json({
        id: 42,
        registration_code: "RTF-ABC123",
        email: "asha@example.com",
        confirmation_email_sent: false,
      }, 201),
      "GET /api/courses/road-to-future/dashboard": () => json({
        course_id: "road-to-future",
        title: "Road to Future",
        overview: "Your course dashboard.",
        live_classes: { status: "Not Set Yet", items: [] },
        recorded_classes: { status: "Not Set Yet", items: [] },
        resources: { status: "Not Set Yet", items: [] },
      }),
    });
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "service_test");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "public_test");
    vi.stubEnv("VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID", "template_test");
    vi.mocked(emailjs.send).mockRejectedValueOnce(new Error("EmailJS unavailable"));
    const user = userEvent.setup();
    renderApp("/courses/road-to-future");
    await user.click((await screen.findAllByRole("button", { name: /register yourself/i }))[0]);
    await user.type(await screen.findByLabelText(/full name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/email address/i), "asha@example.com");
    await user.type(screen.getByLabelText(/mobile number/i), "9876543210");

    await user.click(screen.getByRole("button", { name: /send sms code/i }));
    await user.type(await screen.findByLabelText(/sms verification code/i), "123456");
    await user.click(screen.getByRole("button", { name: /^verify$/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit registration/i })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: /submit registration/i }));
    expect(await screen.findByText(/your registration is saved.*do not submit it again/i)).toBeInTheDocument();
    expect(calls.filter((call) => call.path === "/api/registrations" && call.method === "POST")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /go to course dashboard/i }));
    expect(await screen.findByRole("heading", { name: /road to future course dashboard/i })).toBeInTheDocument();
  });
});

describe("course dashboard", () => {
  it("shows the real enrollment dashboard and keeps unavailable content clearly unconfigured", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    const calls = mockApi({
      "GET /api/auth/me": () => json(USER),
      "GET /api/courses/road-to-future/dashboard": () => json({
        course_id: "road-to-future",
        title: "Road to Future",
        overview: "Your course dashboard.",
        live_classes: { status: "Not Set Yet", items: [] },
        recorded_classes: { status: "Not Set Yet", items: [] },
        resources: { status: "Not Set Yet", items: [] },
      }),
    });
    renderApp("/dashboard/course/road-to-future");
    expect(await screen.findByRole("heading", { name: /road to future course dashboard/i })).toBeInTheDocument();
    expect(screen.getByText("Enrollment verified")).toBeInTheDocument();
    expect(screen.getAllByText("Not Set Yet")).toHaveLength(3);
    expect(calls.some((call) => call.path === "/api/courses/road-to-future/dashboard" && call.auth === "Bearer t")).toBe(true);
  });

  it("does not display course content when the backend denies enrollment", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    mockApi({
      "GET /api/auth/me": () => json(USER),
      "GET /api/courses/road-to-future/dashboard": () => json({ detail: "Course enrollment was not found for this account." }, 404),
    });
    renderApp("/dashboard/course/road-to-future");
    expect(await screen.findByRole("heading", { name: /dashboard unavailable/i })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/only to enrolled accounts/i);
    expect(screen.queryByText("Enrollment verified")).not.toBeInTheDocument();
  });
});

describe("contact form", () => {
  it("validate() flags bad input", () => {
    expect(Object.keys(validate({ name: "", email: "x", company: "", service: "", message: "hi", website: "" })).sort()).toEqual(["email", "message", "name", "service"]);
    expect(validate({ name: "Ravi", email: "r@x.co", company: "", service: "Digital Experiences", message: "A long enough message", website: "" })).toEqual({});
  });

  it("blocks invalid submissions without calling the API", async () => {
    const calls = mockApi(); const user = userEvent.setup(); renderApp("/");
    await user.click(screen.getByRole("button", { name: /start a project/i }));
    expect(await screen.findByText(/enter your name/i)).toBeInTheDocument();
    expect(calls.some((c) => c.path === "/api/enquiries")).toBe(false);
  });

  it("submits a valid enquiry once, then shows success", async () => {
    const calls = mockApi({ "POST /api/enquiries": () => json({ ok: true }, 201) });
    const user = userEvent.setup(); renderApp("/");
    expect(screen.getByText("Ready when you are")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Name"), "Ravi Kumar");
    await user.type(screen.getByLabelText("Email"), "ravi@example.com");
    await user.selectOptions(screen.getByLabelText(/service of interest/i), "Digital Experiences");
    await user.type(screen.getByLabelText(/project description/i), "We need a modern website.");
    await user.click(screen.getByRole("button", { name: /start a project/i }));
    expect(await screen.findByText(/message received/i)).toBeInTheDocument();
    const posts = calls.filter((c) => c.path === "/api/enquiries");
    expect(posts).toHaveLength(1);
    expect(posts[0].body).toMatchObject({ name: "Ravi Kumar", email: "ravi@example.com", service: "Digital Experiences", company: null, website: null });
  });

  it("shows backend errors honestly instead of faking success", async () => {
    mockApi({ "POST /api/enquiries": () => json({ detail: "Too many enquiries from this connection. Please try again later." }, 429) });
    const user = userEvent.setup(); renderApp("/");
    await user.type(screen.getByLabelText("Name"), "Ravi Kumar");
    await user.type(screen.getByLabelText("Email"), "ravi@example.com");
    await user.selectOptions(screen.getByLabelText(/service of interest/i), "Something else");
    await user.type(screen.getByLabelText(/project description/i), "Hello there, long enough.");
    await user.click(screen.getByRole("button", { name: /start a project/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/too many enquiries/i);
    expect(screen.queryByText(/message received/i)).not.toBeInTheDocument();
  });
});

describe("course area (original registration flow preserved)", () => {
  it("course detail â†’ Register opens AuthModal when signed out", async () => {
    mockApi(); const user = userEvent.setup(); renderApp("/courses/road-to-future");
    await user.click((await screen.findAllByRole("button", { name: /register yourself/i }))[0]);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("signed-in user without a registration gets the registration form after the check", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    mockApi({ "GET /api/auth/me": () => json(USER), "GET /api/registrations/mine": () => json([]) });
    const user = userEvent.setup(); renderApp("/courses/road-to-future");
    await user.click((await screen.findAllByRole("button", { name: /register yourself/i }))[0]);
    expect(await screen.findByRole("heading", { name: /register your interest/i })).toBeInTheDocument();
  });
});


describe("course imagery", () => {
  it("uses local illustrative learning photos and labels them honestly", () => {
    mockApi(); renderApp("/courses/road-to-future");
    expect(screen.getByRole("heading", { name: /curiosity gets practical/i })).toBeInTheDocument();
    expect(screen.getByAltText(/teen learners working on laptops/i)).toHaveAttribute("loading", "lazy");
    expect(screen.getByText(/not photos of udaan students/i)).toBeInTheDocument();
  });
});
