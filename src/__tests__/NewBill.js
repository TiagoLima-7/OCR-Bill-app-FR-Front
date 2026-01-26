/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // mock localStorage used by NewBill
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock
    })
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee",
      email: "employee@test.tld"
    }))

    // render the NewBill UI in the document
    document.body.innerHTML = NewBillUI()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    document.body.innerHTML = ''
    // cleanup global fileInput if set
    try { delete global.fileInput } catch(e) {}
  })

  describe("When I open a NewBill Page", () => {
    test("Then the new bill form and fields should be present", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })
  })

  describe("When I select a valid image file", () => {
    test("Then handleChangeFile calls store.create and sets fileUrl, fileName and billId", async () => {
      // prepare fake store with bills().create mock
      const mockCreate = jest.fn().mockResolvedValue({ fileUrl: 'https://img.test/my.jpg', key: 'abc123' })
      const fakeStore = {
        bills: () => ({
          create: mockCreate
        })
      }
console.log("coucou")
      const onNavigate = jest.fn()
      // instantiate NewBill
      const newBill = new NewBill({ document, onNavigate, store: fakeStore, localStorage: window.localStorage })

      // create a File object (valid extension)
      const file = new File(["dummy content"], "receipt.jpg", { type: "image/jpeg" })

      const input = screen.getByTestId("file")

      // define files property on the input (jsdom doesn't set it via fireEvent)
      // Object.defineProperty(input, "files", {
      //   value: [file]
      // })
      Object.defineProperty(input, "files", {
        configurable: true,
        get: () => [file]
      });
      
      // Ensure the method can access fileInput (the original code sets fileInput.value = "")
      // so we expose a global fileInput pointing to the input element
      global.fileInput = input
      fireEvent.change(input)

      // simulate change event with a fake value for e.target.value (path)
      // fireEvent.change(input, { target: { files: [file], value: "C:\\fakepath\\receipt.jpg" } })

      // wait for asynchronous create() to have been called
      await waitFor(() => expect(mockCreate).toHaveBeenCalled())

      // after resolved promise, instance properties should be set
      expect(newBill.fileUrl).toBe("https://img.test/my.jpg")
      expect(newBill.billId).toBe("abc123")
      expect(newBill.fileName).toBe("receipt.jpg")
    })
  })

  describe("When I select an invalid file type", () => {
    test("Then handleChangeFile alerts and does not call store.create", () => {
      // mock store just in case (shouldn't be called)
      const mockCreate = jest.fn()
      const fakeStore = {
        bills: () => ({
          create: mockCreate
        })
      }

      const onNavigate = jest.fn()
      const newBill = new NewBill({ document, onNavigate, store: fakeStore, localStorage: window.localStorage })

      // spy on window.alert
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {})

      // create a File with invalid extension
      const badFile = new File(["dummy"], "badFile.pdf", { type: "application/pdf" })
      const input = screen.getByTestId("file")

      Object.defineProperty(input, "files", {
        configurable: true,
        get: () => [badFile]
      })
      // Object.defineProperty(input, "files", { value: [badFile] })

      // again, ensure fileInput exists globally to avoid ReferenceError / DOM exceptions
      global.fileInput = input

      fireEvent.change(input)

      // should have alerted and should NOT call create
      expect(alertSpy).toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  describe("When I submit the new bill form", () => {
    test("Then handleSubmit should call updateBill and navigate to Bills", () => {
      const onNavigate = jest.fn()
      // fake store is not required since we spy updateBill directly
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })

      // spy the updateBill method on the instance to assert it's called
      const updateSpy = jest.spyOn(newBill, "updateBill").mockImplementation(() => {})

      // set fileUrl and fileName as if the file upload already happened
      newBill.fileUrl = "https://img.test/receipt.png"
      newBill.fileName = "receipt.png"
      newBill.billId = "someId"

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2022-01-10" } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "42" } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "10" } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "business trip" } })

      // submit the form
      fireEvent.submit(screen.getByTestId("form-new-bill"))

      // updateBill should have been called
      expect(updateSpy).toHaveBeenCalled()
      // and navigation to Bills should have been requested
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"])
    })
  })
})

describe("When handleChangeFile fails during store create", () => {
  test("Then it should catch the error and log it to console", async () => {
    // Mock store with create rejecting
    const mockCreate = jest.fn().mockRejectedValue(new Error("Upload error"));
    const fakeStore = {
      bills: () => ({
        create: mockCreate
      })
    };
    
    // Charger l’UI avant, pour avoir les éléments dans le DOM
    document.body.innerHTML = NewBillUI();

    // Mock console.error
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const onNavigate = jest.fn();
    const newBill = new NewBill({ document, onNavigate, store: fakeStore, localStorage: window.localStorage });

    // Créer un fichier valide
    const file = new File(["dummy content"], "receipt.jpg", { type: "image/jpeg" });

    // Récupérer le champ fichier et simuler l'ajout du fichier
    const fileInput = screen.getByTestId("file");
    Object.defineProperty(fileInput, "files", {
      configurable: true,
      get: () => [file]
    });

    // Simuler le changement de fichier (appel à handleChangeFile)
    fireEvent.change(fileInput);

    // Attendre que create ait été appelé et que catch ait loggé l’erreur
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});

