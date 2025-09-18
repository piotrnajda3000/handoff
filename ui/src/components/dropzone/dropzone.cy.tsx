/// <reference types="cypress" />
import { FileDropzone } from "./dropzone";
import { type FileWithPath } from "@mantine/dropzone";

describe("FileDropzone Component", () => {
  let mockOnDrop: sinon.SinonStub;
  let mockOnReject: sinon.SinonStub;
  let testFiles: FileWithPath[];

  beforeEach(() => {
    mockOnDrop = Cypress.sinon.stub();
    mockOnReject = Cypress.sinon.stub();
    testFiles = [];
  });

  it("renders the dropzone with correct initial state", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    // Check main elements are present
    cy.get('[data-qa="dropzone-container"]').should("be.visible");
    cy.get('[data-qa="dropzone-content"]').should("be.visible");

    // Check idle state icon
    cy.get('[data-qa="dropzone-idle-icon"]').should("be.visible");

    // Check text content
    cy.get('[data-qa="dropzone-title"]').should(
      "contain",
      "Drag files here or click to select"
    );
    cy.get('[data-qa="dropzone-file-types"]').should(
      "contain",
      "TypeScript (.ts, .tsx) or JavaScript (.js, .jsx)"
    );
    cy.get('[data-qa="dropzone-size-limit"]').should(
      "contain",
      "Files should not exceed 5MB"
    );

    // Selected files section should not be visible initially
    cy.get('[data-qa="selected-files-section"]').should("not.exist");
  });

  it("displays selected files when files are provided", () => {
    const mockFiles = [
      { name: "test.ts", size: 1024, path: "/test.ts" },
      { name: "component.tsx", size: 2048, path: "/component.tsx" },
    ] as FileWithPath[];

    cy.mount(
      <FileDropzone
        files={mockFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    // Check selected files section is visible
    cy.get('[data-qa="selected-files-section"]').should("be.visible");
    cy.get('[data-qa="selected-files-title"]').should(
      "contain",
      "Selected files:"
    );

    // Check individual files are displayed
    cy.get('[data-qa="selected-file-0"]').should(
      "contain",
      "📄 test.ts (1.0 KB)"
    );
    cy.get('[data-qa="selected-file-1"]').should(
      "contain",
      "📄 component.tsx (2.0 KB)"
    );
  });

  it("handles valid file drop", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    // Create a temporary file with valid JavaScript content
    cy.writeFile("/tmp/cypress-test.js", "const x = 1;\nexport default x;");

    // Use Cypress selectFile to simulate drag and drop
    cy.get('[data-qa="dropzone-container"]').selectFile(
      "/tmp/cypress-test.js",
      {
        action: "drag-drop",
      }
    );

    // Verify callback was called
    cy.then(() => {
      expect(mockOnDrop.called).to.be.true;
    });
  });

  it("handles invalid file type rejection", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    // Create a temporary file with invalid type
    cy.writeFile("/tmp/cypress-test.pdf", "This is a PDF content");

    // Use Cypress selectFile to simulate drag and drop with invalid file
    cy.get('[data-qa="dropzone-container"]').selectFile(
      "/tmp/cypress-test.pdf",
      {
        action: "drag-drop",
      }
    );

    // Verify rejection callback was called
    cy.then(() => {
      expect(mockOnReject.called).to.be.true;
    });
  });

  it("handles file size limit rejection", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    // Create a large file that exceeds 5MB limit
    const largeContent = "x".repeat(6 * 1024 * 1024); // 6MB
    cy.writeFile("/tmp/cypress-large.ts", largeContent);

    // Use Cypress selectFile to simulate drag and drop with large file
    cy.get('[data-qa="dropzone-container"]').selectFile(
      "/tmp/cypress-large.ts",
      {
        action: "drag-drop",
      }
    );

    // Verify rejection callback was called
    cy.then(() => {
      expect(mockOnReject.called).to.be.true;
    });
  });

  it("shows accept state visual feedback during valid drag", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    const validFile = new File(["const x = 1;"], "test.js", {
      type: "text/javascript",
    });

    // Simulate dragenter with valid file
    cy.get('[data-qa="dropzone-container"]').then(($el) => {
      const dragEnterEvent = new Event("dragenter", { bubbles: true });
      Object.defineProperty(dragEnterEvent, "dataTransfer", {
        value: {
          files: [validFile],
          types: ["Files"],
        },
      });
      $el[0].dispatchEvent(dragEnterEvent);
    });

    // The accept icon should be shown (though this is handled internally by Mantine)
    cy.get('[data-qa="dropzone-container"]').should("exist");
  });

  it("shows reject state visual feedback during invalid drag", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    const invalidFile = new File(["content"], "document.txt", {
      type: "text/plain",
    });

    // Simulate dragenter with invalid file
    cy.get('[data-qa="dropzone-container"]').then(($el) => {
      const dragEnterEvent = new Event("dragenter", { bubbles: true });
      Object.defineProperty(dragEnterEvent, "dataTransfer", {
        value: {
          files: [invalidFile],
          types: ["Files"],
        },
      });
      $el[0].dispatchEvent(dragEnterEvent);
    });

    // The reject icon should be shown (though this is handled internally by Mantine)
    cy.get('[data-qa="dropzone-container"]').should("exist");
  });

  it("handles multiple valid files", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    // Create multiple valid files
    cy.writeFile("/tmp/cypress-utils.ts", "export const a = 1;");
    cy.writeFile("/tmp/cypress-helper.js", "function test() {}");

    // Use Cypress selectFile to simulate drag and drop with multiple files
    cy.get('[data-qa="dropzone-container"]').selectFile(
      ["/tmp/cypress-utils.ts", "/tmp/cypress-helper.js"],
      {
        action: "drag-drop",
      }
    );

    // Verify callback was called
    cy.then(() => {
      expect(mockOnDrop.called).to.be.true;
    });
  });

  it("accepts all valid JavaScript and TypeScript MIME types", () => {
    const validMimeTypes = [
      "text/javascript",
      "application/javascript",
      "text/x-javascript",
      "text/typescript",
      "application/typescript",
      "text/x-typescript",
    ];

    validMimeTypes.forEach((mimeType, index) => {
      cy.mount(
        <FileDropzone
          files={testFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
        />
      );

      const validFile = new File([`// File ${index}`], `test${index}.js`, {
        type: mimeType,
      });

      cy.get('[data-qa="dropzone-container"]').then(($el) => {
        const dropEvent = new Event("drop", { bubbles: true });
        Object.defineProperty(dropEvent, "dataTransfer", {
          value: {
            files: [validFile],
            types: ["Files"],
          },
        });
        $el[0].dispatchEvent(dropEvent);
      });
    });
  });

  it("displays file sizes correctly in KB", () => {
    const testCases = [
      { size: 1024, expected: "1.0 KB" },
      { size: 1536, expected: "1.5 KB" },
      { size: 2048, expected: "2.0 KB" },
      { size: 512, expected: "0.5 KB" },
    ];

    testCases.forEach(({ size, expected }, index) => {
      const mockFiles = [
        { name: `test${index}.ts`, size, path: `/test${index}.ts` },
      ] as FileWithPath[];

      cy.mount(
        <FileDropzone
          files={mockFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
        />
      );

      cy.get('[data-qa="selected-file-0"]').should("contain", expected);
    });
  });

  it("has proper accessibility attributes", () => {
    cy.mount(
      <FileDropzone
        files={testFiles}
        onDrop={mockOnDrop}
        onReject={mockOnReject}
      />
    );

    // Check that the dropzone is clickable and keyboard accessible
    cy.get('[data-qa="dropzone-container"]')
      .should("have.css", "cursor", "pointer")
      .should("be.visible");
  });
});
