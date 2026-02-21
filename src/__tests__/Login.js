/**
 * @jest-environment jsdom
 */

// Vue Login
import LoginUI from "../views/LoginUI";

// Container Login (logique métier)
import Login from "../containers/Login.js";

// Helpers Testing Library
import { fireEvent, screen } from "@testing-library/dom";


/**
 * ===============================
 * UTILITAIRE – flushPromises
 * ===============================
 * Permet d’attendre la résolution
 * des Promises (simule boucle event loop)
 */
const flushPromises = () =>
  new Promise(resolve => setTimeout(resolve, 0));


/**
 * ===============================
 * TESTS – Login Employee
 * ===============================
 */
describe("Login Page - Employee", () => {

  beforeEach(() => {

    // Rendu initial de la page Login
    document.body.innerHTML = LoginUI();

    // Mock minimal du localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });


  test("Employee login stores jwt and navigates to Bills", async () => {

    // Simulation saisie email
    fireEvent.change(screen.getByTestId("employee-email-input"), {
      target: { value: "employee@test.com" },
    });

    // Simulation saisie password
    fireEvent.change(screen.getByTestId("employee-password-input"), {
      target: { value: "password" },
    });

    // Mock API login
    const storeMock = {
      login: jest.fn(() =>
        Promise.resolve({ jwt: "fake-jwt-token" })
      ),
    };

    const onNavigate = jest.fn();

    // Initialisation container Login
    new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
      PREVIOUS_LOCATION: "",
      store: storeMock,
    });

    // Soumission formulaire employé
    fireEvent.submit(screen.getByTestId("form-employee"));

    // Attente résolution Promise login()
    await flushPromises();

    // Vérifications
    expect(storeMock.login).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "jwt",
      "fake-jwt-token"
    );
    expect(onNavigate).toHaveBeenCalledWith("#employee/bills");
  });
});


/**
 * ===============================
 * TESTS – Login Admin
 * ===============================
 */
describe("Login Page - Admin", () => {

  beforeEach(() => {

    document.body.innerHTML = LoginUI();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });


  test("Admin login stores jwt and navigates to Dashboard", async () => {

    // Simulation saisie admin email
    fireEvent.change(screen.getByTestId("admin-email-input"), {
      target: { value: "admin@test.com" },
    });

    // Simulation saisie admin password
    fireEvent.change(screen.getByTestId("admin-password-input"), {
      target: { value: "adminpass" },
    });

    const storeMock = {
      login: jest.fn(() =>
        Promise.resolve({ jwt: "admin-jwt" })
      ),
    };

    const onNavigate = jest.fn();

    new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
      PREVIOUS_LOCATION: "",
      store: storeMock,
    });

    // Soumission formulaire admin
    fireEvent.submit(screen.getByTestId("form-admin"));

    await flushPromises();

    // Vérifications
    expect(storeMock.login).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "jwt",
      "admin-jwt"
    );
    expect(onNavigate).toHaveBeenCalledWith("#admin/dashboard");
  });
});


/**
 * ===============================
 * TESTS – Méthodes internes Login
 * ===============================
 */
describe("Login internal methods coverage", () => {

  beforeEach(() => {

    document.body.innerHTML = LoginUI();

    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
      },
      writable: true,
    });
  });


  test("login() stores jwt in localStorage", async () => {

    const storeMock = {
      login: jest.fn(() =>
        Promise.resolve({ jwt: "jwt-token" })
      ),
    };

    const loginInstance = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      store: storeMock,
    });

    // Appel direct méthode login()
    await loginInstance.login({
      email: "test@test.com",
      password: "1234",
    });

    expect(storeMock.login).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "jwt",
      "jwt-token"
    );
  });


  test("createUser() creates user and then calls login()", async () => {

    const loginSpy = jest.fn(() =>
      Promise.resolve({ jwt: "jwt-after-create" })
    );

    const storeMock = {
      login: loginSpy,
      users: () => ({
        create: jest.fn(() => Promise.resolve()),
      }),
    };

    const loginInstance = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      store: storeMock,
    });

    // Appel création utilisateur
    await loginInstance.createUser({
      type: "Employee",
      email: "newuser@test.com",
      password: "pass",
    });

    // Vérifie que login() est bien déclenché après create()
    expect(loginSpy).toHaveBeenCalled();
  });


  /**
   * --------------------------------
   * Comportement constructeur
   * --------------------------------
   */
  describe("Login constructor behavior", () => {

    test("It should attach submit listeners for employee and admin forms", () => {

      document.body.innerHTML = LoginUI();

      // Spy sur addEventListener
      const spy = jest.spyOn(
        HTMLFormElement.prototype,
        "addEventListener"
      );

      new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: "",
        store: null,
      });

      // Vérifie qu’un listener submit est attaché
      expect(spy).toHaveBeenCalledWith(
        "submit",
        expect.any(Function)
      );

      spy.mockRestore();
    });
  });


  /**
   * --------------------------------
   * login() sans store
   * --------------------------------
   */
  describe("login() without store", () => {

    test("login returns null if store is undefined", async () => {

      document.body.innerHTML = LoginUI();

      const loginInstance = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: "",
        store: null,
      });

      const result = await loginInstance.login({
        email: "test@test.com",
        password: "1234",
      });

      expect(result).toBeNull();
    });
  });


  /**
   * --------------------------------
   * createUser() sans store
   * --------------------------------
   */
  describe("createUser() without store", () => {

    test("createUser returns null if store is undefined", async () => {

      document.body.innerHTML = LoginUI();

      const loginInstance = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(),
        PREVIOUS_LOCATION: "",
        store: null,
      });

      const result = await loginInstance.createUser({
        type: "Employee",
        email: "no-store@test.com",
        password: "pass",
      });

      expect(result).toBeNull();
    });
  });

});
