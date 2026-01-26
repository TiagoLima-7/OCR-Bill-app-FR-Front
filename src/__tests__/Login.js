// /**
//  * @jest-environment jsdom
//  */

// import LoginUI from "../views/LoginUI";
// import Login from "../containers/Login.js";
// import { ROUTES } from "../constants/routes";
// import { fireEvent, screen } from "@testing-library/dom";

// describe("Given that I am a user on login page", () => {
//   describe("When I do not fill fields and I click on employee button Login In", () => {
//     test("Then It should renders Login page", () => {
//       document.body.innerHTML = LoginUI();

//       const inputEmailUser = screen.getByTestId("employee-email-input");
//       expect(inputEmailUser.value).toBe("");

//       const inputPasswordUser = screen.getByTestId("employee-password-input");
//       expect(inputPasswordUser.value).toBe("");

//       const form = screen.getByTestId("form-employee");
//       const handleSubmit = jest.fn((e) => e.preventDefault());

//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(screen.getByTestId("form-employee")).toBeTruthy();
//     });
//   });

//   describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
//     test("Then It should renders Login page", () => {
//       document.body.innerHTML = LoginUI();

//       const inputEmailUser = screen.getByTestId("employee-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
//       expect(inputEmailUser.value).toBe("pasunemail");

//       const inputPasswordUser = screen.getByTestId("employee-password-input");
//       fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
//       expect(inputPasswordUser.value).toBe("azerty");

//       const form = screen.getByTestId("form-employee");
//       const handleSubmit = jest.fn((e) => e.preventDefault());

//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(screen.getByTestId("form-employee")).toBeTruthy();
//     });
//   });

//   describe("When I do fill fields in correct format and I click on employee button Login In", () => {
//     test("Then I should be identified as an Employee in app", () => {
//       document.body.innerHTML = LoginUI();
//       const inputData = {
//         email: "johndoe@email.com",
//         password: "azerty",
//       };

//       const inputEmailUser = screen.getByTestId("employee-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
//       expect(inputEmailUser.value).toBe(inputData.email);

//       const inputPasswordUser = screen.getByTestId("employee-password-input");
//       fireEvent.change(inputPasswordUser, {
//         target: { value: inputData.password },
//       });
//       expect(inputPasswordUser.value).toBe(inputData.password);

//       const form = screen.getByTestId("form-employee");

//       // localStorage should be populated with form data
//       Object.defineProperty(window, "localStorage", {
//         value: {
//           getItem: jest.fn(() => null),
//           setItem: jest.fn(() => null),
//         },
//         writable: true,
//       });

//       // we have to mock navigation to test it
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname });
//       };

//       let PREVIOUS_LOCATION = "";

//       const store = jest.fn();

//       const login = new Login({
//         document,
//         localStorage: window.localStorage,
//         onNavigate,
//         PREVIOUS_LOCATION,
//         store,
//       });

//       const handleSubmit = jest.fn(login.handleSubmitEmployee);
//       login.login = jest.fn().mockResolvedValue({});
//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(handleSubmit).toHaveBeenCalled();
//       expect(window.localStorage.setItem).toHaveBeenCalled();
//       expect(window.localStorage.setItem).toHaveBeenCalledWith(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//           email: inputData.email,
//           password: inputData.password,
//           status: "connected",
//         })
//       );
//     });

//     test("It should renders Bills page", () => {
//       expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
//     });

//     test("It should call createUser if login rejects for employee", async () => {
//       document.body.innerHTML = LoginUI();
//       const inputEmailUser = screen.getByTestId("employee-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: "testuser@email.com" } });
//       const inputPasswordUser = screen.getByTestId("employee-password-input");
//       fireEvent.change(inputPasswordUser, { target: { value: "password123" } });
//       const form = screen.getByTestId("form-employee");

//       const loginInstance = new Login({
//         document,
//         localStorage: window.localStorage,
//         onNavigate: jest.fn(),
//         PREVIOUS_LOCATION: '',
//         store: {
//           login: jest.fn(() => Promise.reject()),
//           users: () => ({
//             create: jest.fn(() => Promise.resolve())
//           }),
//         },
//       });

//       loginInstance.createUser = jest.fn().mockResolvedValue();
//       loginInstance.login = jest.fn(() => Promise.reject());
//       form.addEventListener("submit", loginInstance.handleSubmitEmployee);
//       fireEvent.submit(form);

//       // await new Promise(setImmediate); // attend la fin des promesses
//       await new Promise(resolve => setTimeout(resolve, 0));
//       expect(loginInstance.login).toHaveBeenCalled();
//       expect(loginInstance.createUser).toHaveBeenCalled();
//     });
//   });
// });

// describe("Given that I am a user on login page", () => {
//   describe("When I do not fill fields and I click on admin button Login In", () => {
//     test("Then It should renders Login page", () => {
//       document.body.innerHTML = LoginUI();

//       const inputEmailUser = screen.getByTestId("admin-email-input");
//       expect(inputEmailUser.value).toBe("");

//       const inputPasswordUser = screen.getByTestId("admin-password-input");
//       expect(inputPasswordUser.value).toBe("");

//       const form = screen.getByTestId("form-admin");
//       const handleSubmit = jest.fn((e) => e.preventDefault());

//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(screen.getByTestId("form-admin")).toBeTruthy();
//     });
//   });

//   describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
//     test("Then it should renders Login page", () => {
//       document.body.innerHTML = LoginUI();

//       const inputEmailUser = screen.getByTestId("admin-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
//       expect(inputEmailUser.value).toBe("pasunemail");

//       const inputPasswordUser = screen.getByTestId("admin-password-input");
//       fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
//       expect(inputPasswordUser.value).toBe("azerty");

//       const form = screen.getByTestId("form-admin");
//       const handleSubmit = jest.fn((e) => e.preventDefault());

//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(screen.getByTestId("form-admin")).toBeTruthy();
//     });
//   });

//   describe("When I do fill fields in correct format and I click on admin button Login In", () => {
//     test("Then I should be identified as an HR admin in app", () => {
//       document.body.innerHTML = LoginUI();
//       const inputData = {
//         type: "Admin",
//         email: "johndoe@email.com",
//         password: "azerty",
//         status: "connected",
//       };

//       const inputEmailUser = screen.getByTestId("admin-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
//       expect(inputEmailUser.value).toBe(inputData.email);

//       const inputPasswordUser = screen.getByTestId("admin-password-input");
//       fireEvent.change(inputPasswordUser, {
//         target: { value: inputData.password },
//       });
//       expect(inputPasswordUser.value).toBe(inputData.password);

//       const form = screen.getByTestId("form-admin");

//       // localStorage should be populated with form data
//       Object.defineProperty(window, "localStorage", {
//         value: {
//           getItem: jest.fn(() => null),
//           setItem: jest.fn(() => null),
//         },
//         writable: true,
//       });

//       // we have to mock navigation to test it
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname });
//       };

//       let PREVIOUS_LOCATION = "";

//       const store = jest.fn();

//       const login = new Login({
//         document,
//         localStorage: window.localStorage,
//         onNavigate,
//         PREVIOUS_LOCATION,
//         store,
//       });

//       const handleSubmit = jest.fn(login.handleSubmitAdmin);
//       login.login = jest.fn().mockResolvedValue({});
//       form.addEventListener("submit", handleSubmit);
//       fireEvent.submit(form);
//       expect(handleSubmit).toHaveBeenCalled();
//       expect(window.localStorage.setItem).toHaveBeenCalled();
//       expect(window.localStorage.setItem).toHaveBeenCalledWith(
//         "user",
//         JSON.stringify({
//           type: "Admin",
//           email: inputData.email,
//           password: inputData.password,
//           status: "connected",
//         })
//       );
//     });

//     test("It should renders HR dashboard page", () => {
//       expect(screen.queryByText("Validations")).toBeTruthy();
//     });

//     test("handleSubmitAdmin calls login, handles rejection and navigates", async () => {
//       document.body.innerHTML = LoginUI();

//       const inputEmailUser = screen.getByTestId("admin-email-input");
//       fireEvent.change(inputEmailUser, { target: { value: "admin@example.com" } });
//       const inputPasswordUser = screen.getByTestId("admin-password-input");
//       fireEvent.change(inputPasswordUser, { target: { value: "adminpass" } });

//       const form = screen.getByTestId("form-admin");

//       const onNavigateMock = jest.fn();
//       const storeMock = {
//         login: jest.fn(() => Promise.reject()), // Simule rejet
//         users: () => ({ create: jest.fn(() => Promise.resolve()) })
//       };

//       const loginInstance = new Login({
//         document,
//         localStorage: window.localStorage,
//         onNavigate: onNavigateMock,
//         PREVIOUS_LOCATION: "",
//         store: storeMock,
//       });

//       loginInstance.createUser = jest.fn(() => Promise.resolve());
//       loginInstance.login = jest.fn(() => Promise.reject());

//       form.addEventListener("submit", loginInstance.handleSubmitAdmin);
//       fireEvent.submit(form);

//       await new Promise(resolve => setTimeout(resolve, 0));

//       expect(loginInstance.login).toHaveBeenCalled();

//       expect(loginInstance.createUser).toHaveBeenCalled();

//       expect(window.localStorage.setItem).toHaveBeenCalledWith(
//         "user",
//         JSON.stringify({
//           type: "Admin",
//           email: "admin@example.com",
//           password: "adminpass",
//           status: "connected",
//         })
//       );

//       expect(onNavigateMock).toHaveBeenCalledWith("#admin/dashboard");

//       expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)");
//     });
//   });
// });

/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { fireEvent, screen } from "@testing-library/dom";

const flushPromises = () =>
  new Promise(resolve => setTimeout(resolve, 0));

describe("Login Page - Employee", () => {
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

  test("Employee login stores jwt and navigates to Bills", async () => {
    fireEvent.change(screen.getByTestId("employee-email-input"), {
      target: { value: "employee@test.com" },
    });

    fireEvent.change(screen.getByTestId("employee-password-input"), {
      target: { value: "password" },
    });

    const storeMock = {
      login: jest.fn(() =>
        Promise.resolve({ jwt: "fake-jwt-token" })
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

    fireEvent.submit(screen.getByTestId("form-employee"));

    await flushPromises();

    expect(storeMock.login).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "jwt",
      "fake-jwt-token"
    );
    expect(onNavigate).toHaveBeenCalledWith("#employee/bills");
  });
});

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
    fireEvent.change(screen.getByTestId("admin-email-input"), {
      target: { value: "admin@test.com" },
    });

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

    fireEvent.submit(screen.getByTestId("form-admin"));

    await flushPromises();

    expect(storeMock.login).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "jwt",
      "admin-jwt"
    );
    expect(onNavigate).toHaveBeenCalledWith("#admin/dashboard");
  });
});

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

    await loginInstance.createUser({
      type: "Employee",
      email: "newuser@test.com",
      password: "pass",
    });

    expect(loginSpy).toHaveBeenCalled();
  });

  describe("Login constructor behavior", () => {
  test("It should attach submit listeners for employee and admin forms", () => {
    document.body.innerHTML = LoginUI();

    const spyEmployee = jest.spyOn(
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

    expect(spyEmployee).toHaveBeenCalledWith(
      "submit",
      expect.any(Function)
    );

    spyEmployee.mockRestore();
  });
});

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
