/**
 * @jest-environment jsdom
 */

// Helpers Testing Library
import { fireEvent, screen, waitFor } from "@testing-library/dom"

// UI & Container testés
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

// Constantes & Mocks
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"


/**
 * ===============================
 * TESTS – NewBill (Employee)
 * ===============================
 */
describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    /**
     * Mock du localStorage utilisé par NewBill
     */
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock
    })

    /**
     * Simule un utilisateur Employee connecté
     */
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee",
      email: "employee@test.tld"
    }))

    /**
     * Rendu de l’UI NewBill dans le DOM
     */
    document.body.innerHTML = NewBillUI()
  })

  afterEach(() => {
    /**
     * Nettoyage des mocks et du DOM
     */
    jest.restoreAllMocks()
    document.body.innerHTML = ''

    /**
     * Suppression sécurisée du fileInput global si défini
     */
    try { delete global.fileInput } catch(e) {}
  })


  /**
   * --------------------------------
   * Chargement de la page NewBill
   * --------------------------------
   */
  describe("When I open a NewBill Page", () => {

    test("Then the new bill form and fields should be present", () => {

      // Vérifie présence du formulaire
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()

      // Vérifie présence des champs principaux
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })
  })


  /**
   * --------------------------------
   * Upload fichier valide
   * --------------------------------
   */
  describe("When I select a valid image file", () => {

    test("Then handleChangeFile calls store.create and sets fileUrl, fileName and billId", async () => {

      /**
       * Fake store avec mock create()
       */
      const mockCreate = jest.fn().mockResolvedValue({
        fileUrl: 'https://img.test/my.jpg',
        key: 'abc123'
      })

      const fakeStore = {
        bills: () => ({
          create: mockCreate
        })
      }

      const onNavigate = jest.fn()

      /**
       * Instanciation du container
       */
      const newBill = new NewBill({
        document,
        onNavigate,
        store: fakeStore,
        localStorage: window.localStorage
      })

      /**
       * Création d’un fichier image valide
       */
      const file = new File(
        ["dummy content"],
        "receipt.jpg",
        { type: "image/jpeg" }
      )

      const input = screen.getByTestId("file")

      /**
       * jsdom ne gère pas automatiquement input.files
       * → On le mock manuellement
       */
      Object.defineProperty(input, "files", {
        configurable: true,
        get: () => [file]
      })

      /**
       * Certaines implémentations utilisent fileInput.value = ""
       * → On expose le champ globalement
       */
      global.fileInput = input

      /**
       * Simulation du changement de fichier
       */
      fireEvent.change(input)

      /**
       * Attente de l’appel asynchrone create()
       */
      await waitFor(() => expect(mockCreate).toHaveBeenCalled())

      /**
       * Vérifie mise à jour des propriétés internes
       */
      expect(newBill.fileUrl).toBe("https://img.test/my.jpg")
      expect(newBill.billId).toBe("abc123")
      expect(newBill.fileName).toBe("receipt.jpg")
    })
  })


  /**
   * --------------------------------
   * Upload fichier invalide
   * --------------------------------
   */
  describe("When I select an invalid file type", () => {

    test("Then handleChangeFile alerts and does not call store.create", () => {

      const mockCreate = jest.fn()

      const fakeStore = {
        bills: () => ({
          create: mockCreate
        })
      }

      const onNavigate = jest.fn()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: fakeStore,
        localStorage: window.localStorage
      })

      /**
       * Spy sur window.alert
       */
      const alertSpy = jest
        .spyOn(window, "alert")
        .mockImplementation(() => {})

      /**
       * Création d’un fichier invalide (pdf)
       */
      const badFile = new File(
        ["dummy"],
        "badFile.pdf",
        { type: "application/pdf" }
      )

      const input = screen.getByTestId("file")

      Object.defineProperty(input, "files", {
        configurable: true,
        get: () => [badFile]
      })

      global.fileInput = input

      /**
       * Simulation du change
       */
      fireEvent.change(input)

      /**
       * Vérifications
       */
      expect(alertSpy).toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })


  /**
   * --------------------------------
   * Soumission du formulaire
   * --------------------------------
   */
  describe("When I submit the new bill form", () => {

    test("Then handleSubmit should call updateBill and navigate to Bills", () => {

      const onNavigate = jest.fn()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      /**
       * Spy sur updateBill()
       */
      const updateSpy = jest
        .spyOn(newBill, "updateBill")
        .mockImplementation(() => {})

      /**
       * Simule upload déjà effectué
       */
      newBill.fileUrl = "https://img.test/receipt.png"
      newBill.fileName = "receipt.png"
      newBill.billId = "someId"

      /**
       * Remplit les champs du formulaire
       */
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2022-01-10" } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "42" } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "10" } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "business trip" } })

      /**
       * Soumission
       */
      fireEvent.submit(screen.getByTestId("form-new-bill"))

      /**
       * Vérifications
       */
      expect(updateSpy).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"])
    })
  })
})


/**
 * ===============================
 * TEST – Gestion erreur upload
 * ===============================
 */
describe("When handleChangeFile fails during store create", () => {

  test("Then it should catch the error and log it to console", async () => {

    /**
     * Store mocké avec rejet
     */
    const mockCreate = jest
      .fn()
      .mockRejectedValue(new Error("Upload error"))

    const fakeStore = {
      bills: () => ({
        create: mockCreate
      })
    }

    /**
     * Rendu UI
     */
    document.body.innerHTML = NewBillUI()

    /**
     * Spy console.error
     */
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {})

    const onNavigate = jest.fn()

    const newBill = new NewBill({
      document,
      onNavigate,
      store: fakeStore,
      localStorage: window.localStorage
    })

    /**
     * Fichier valide
     */
    const file = new File(
      ["dummy content"],
      "receipt.jpg",
      { type: "image/jpeg" }
    )

    const fileInput = screen.getByTestId("file")

    Object.defineProperty(fileInput, "files", {
      configurable: true,
      get: () => [file]
    })

    /**
     * Déclenchement erreur upload
     */
    fireEvent.change(fileInput)

    /**
     * Attente appel + log erreur
     */
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})
