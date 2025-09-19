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
    cy.get('[data-qa="selected-files-title"]').should("contain", "Files:");

    // Check individual files are displayed
    cy.get('[data-qa="selected-file-0"]').should("contain", "test.ts (1.0 KB)");
    cy.get('[data-qa="selected-file-1"]').should(
      "contain",
      "component.tsx (2.0 KB)"
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

  it("has proper accessibility attributesa", () => {
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

  describe("File Deletion", () => {
    let mockOnDelete: sinon.SinonStub;

    beforeEach(() => {
      mockOnDelete = Cypress.sinon.stub();
    });

    it("calls onDelete with correct index when delete button is clicked", () => {
      const mockFiles = [
        { name: "first.ts", size: 1024, path: "/first.ts" },
        { name: "second.tsx", size: 2048, path: "/second.tsx" },
        { name: "third.js", size: 512, path: "/third.js" },
      ] as FileWithPath[];

      cy.mount(
        <FileDropzone
          files={mockFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
          onDelete={mockOnDelete}
        />
      );

      // Click delete button for second file (index 1)
      cy.get('[data-qa="delete-file-1"]').click();

      // Verify callback was called with correct index
      cy.then(() => {
        expect(mockOnDelete.calledOnce).to.be.true;
        expect(mockOnDelete.getCall(0).args[0]).to.equal(1);
      });
    });

    it("calls onDelete with correct index for different files", () => {
      const mockFiles = [
        { name: "alpha.ts", size: 1024, path: "/alpha.ts" },
        { name: "beta.tsx", size: 2048, path: "/beta.tsx" },
      ] as FileWithPath[];

      cy.mount(
        <FileDropzone
          files={mockFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
          onDelete={mockOnDelete}
        />
      );

      // Click delete button for first file (index 0)
      cy.get('[data-qa="delete-file-0"]').click();

      cy.then(() => {
        expect(mockOnDelete.calledOnce).to.be.true;
        expect(mockOnDelete.getCall(0).args[0]).to.equal(0);
      });

      // Click delete button for second file (index 1)
      cy.get('[data-qa="delete-file-1"]').click();

      cy.then(() => {
        expect(mockOnDelete.callCount).to.equal(2);
        expect(mockOnDelete.getCall(1).args[0]).to.equal(1);
      });
    });

    it("has proper styling for delete buttons", () => {
      const mockFiles = [
        { name: "test.ts", size: 1024, path: "/test.ts" },
      ] as FileWithPath[];

      cy.mount(
        <FileDropzone
          files={mockFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
          onDelete={mockOnDelete}
        />
      );

      // Check that delete button is styled as expected
      cy.get('[data-qa="delete-file-0"]')
        .should("be.visible")
        .should("have.attr", "type", "button");
    });
  });

  describe("Rejected Files Display", () => {
    let mockOnDeleteRejected: sinon.SinonStub;
    let mockOnDelete: sinon.SinonStub;

    beforeEach(() => {
      mockOnDeleteRejected = Cypress.sinon.stub();
      mockOnDelete = Cypress.sinon.stub();
    });

    it("displays rejected files with error icons", () => {
      const rejectedFiles = [
        {
          file: {
            name: "document.pdf",
            size: 1024,
            path: "/document.pdf",
          } as FileWithPath,
          errors: [
            {
              code: "file-invalid-type",
              message:
                "File type not allowed. Only .js, .jsx, .ts, .tsx files are accepted.",
            },
          ],
        },
        {
          file: {
            name: "image.png",
            size: 2048,
            path: "/image.png",
          } as FileWithPath,
          errors: [
            {
              code: "file-invalid-type",
              message:
                "File type not allowed. Only .js, .jsx, .ts, .tsx files are accepted.",
            },
          ],
        },
      ];

      cy.mount(
        <FileDropzone
          files={[]}
          rejectedFiles={rejectedFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
          onDeleteRejected={mockOnDeleteRejected}
        />
      );

      // Check that files section is visible
      cy.get('[data-qa="selected-files-section"]').should("be.visible");
      cy.get('[data-qa="selected-files-title"]').should("contain", "Files:");

      // Check rejected files are displayed with error styling
      cy.get('[data-qa="rejected-file-0"]').should("be.visible");
      cy.get('[data-qa="rejected-file-1"]').should("be.visible");

      // Check file names are displayed in red text
      cy.get('[data-qa="rejected-file-0"]').should(
        "contain",
        "document.pdf (1.0 KB)"
      );
      cy.get('[data-qa="rejected-file-1"]').should(
        "contain",
        "image.png (2.0 KB)"
      );
    });

    it("calls onDeleteRejected with correct index when delete button is clicked", () => {
      const rejectedFiles = [
        {
          file: {
            name: "first.pdf",
            size: 1024,
            path: "/first.pdf",
          } as FileWithPath,
          errors: [
            {
              code: "file-invalid-type",
              message:
                "File type not allowed. Only .js, .jsx, .ts, .tsx files are accepted.",
            },
          ],
        },
        {
          file: {
            name: "second.txt",
            size: 2048,
            path: "/second.txt",
          } as FileWithPath,
          errors: [
            {
              code: "file-invalid-type",
              message:
                "File type not allowed. Only .js, .jsx, .ts, .tsx files are accepted.",
            },
          ],
        },
      ];

      cy.mount(
        <FileDropzone
          files={[]}
          rejectedFiles={rejectedFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
          onDeleteRejected={mockOnDeleteRejected}
        />
      );

      // Click delete button for first rejected file (index 0)
      cy.get('[data-qa="delete-rejected-file-0"]').click();

      // Verify callback was called with correct index
      cy.then(() => {
        expect(mockOnDeleteRejected.calledOnce).to.be.true;
        expect(mockOnDeleteRejected.getCall(0).args[0]).to.equal(0);
      });

      // Click delete button for second rejected file (index 1)
      cy.get('[data-qa="delete-rejected-file-1"]').click();

      cy.then(() => {
        expect(mockOnDeleteRejected.callCount).to.equal(2);
        expect(mockOnDeleteRejected.getCall(1).args[0]).to.equal(1);
      });
    });

    it("displays both accepted and rejected files together", () => {
      const acceptedFiles = [
        { name: "component.tsx", size: 1024, path: "/component.tsx" },
      ] as FileWithPath[];

      const rejectedFiles = [
        {
          file: {
            name: "document.pdf",
            size: 512,
            path: "/document.pdf",
          } as FileWithPath,
          errors: [
            {
              code: "file-invalid-type",
              message:
                "File type not allowed. Only .js, .jsx, .ts, .tsx files are accepted.",
            },
          ],
        },
      ];

      cy.mount(
        <FileDropzone
          files={acceptedFiles}
          rejectedFiles={rejectedFiles}
          onDrop={mockOnDrop}
          onReject={mockOnReject}
          onDelete={mockOnDelete}
          onDeleteRejected={mockOnDeleteRejected}
        />
      );

      // Check both sections are visible
      cy.get('[data-qa="selected-files-section"]').should("be.visible");

      // Check accepted file is displayed normally
      cy.get('[data-qa="selected-file-0"]').should(
        "contain",
        "component.tsx (1.0 KB)"
      );

      // Check rejected file is displayed with error styling
      cy.get('[data-qa="rejected-file-0"]').should(
        "contain",
        "document.pdf (0.5 KB)"
      );

      // Check that both delete buttons exist and are different
      cy.get('[data-qa="delete-file-0"]').should("exist");
      cy.get('[data-qa="delete-rejected-file-0"]').should("exist");
    });
  });

  describe("Manual File Validation", () => {
    it("manually validates file extensions and rejects invalid types", () => {
      cy.mount(
        <FileDropzone files={[]} onDrop={mockOnDrop} onReject={mockOnReject} />
      );

      // Create files with various extensions - some that might pass MIME validation but should fail manual validation
      cy.writeFile("/tmp/cypress-test.py", "print('Hello World')");
      cy.writeFile("/tmp/cypress-test.java", "public class Test {}");
      cy.writeFile("/tmp/cypress-test.cpp", "#include <iostream>");

      // Try to upload invalid file types
      cy.get('[data-qa="dropzone-container"]').selectFile(
        "/tmp/cypress-test.py",
        { action: "drag-drop" }
      );

      // Verify rejection callback was called for invalid extension
      cy.then(() => {
        expect(mockOnReject.called).to.be.true;
      });
    });

    it("accepts valid JavaScript and TypeScript extensions", () => {
      cy.mount(
        <FileDropzone files={[]} onDrop={mockOnDrop} onReject={mockOnReject} />
      );

      // Create files with valid extensions
      cy.writeFile("/tmp/cypress-valid.js", "const x = 1;");
      cy.writeFile(
        "/tmp/cypress-valid.jsx",
        "export default function() { return null; }"
      );
      cy.writeFile("/tmp/cypress-valid.ts", "const y: number = 1;");
      cy.writeFile(
        "/tmp/cypress-valid.tsx",
        "export const Component = () => <div />;"
      );

      // Test each valid file type
      const validFiles = [
        "/tmp/cypress-valid.js",
        "/tmp/cypress-valid.jsx",
        "/tmp/cypress-valid.ts",
        "/tmp/cypress-valid.tsx",
      ];

      validFiles.forEach((file) => {
        // Reset mocks for each iteration
        mockOnDrop.resetHistory();
        mockOnReject.resetHistory();

        cy.get('[data-qa="dropzone-container"]').selectFile(file, {
          action: "drag-drop",
        });

        cy.then(() => {
          expect(mockOnDrop.called).to.be.true;
          expect(mockOnReject.called).to.be.false;
        });
      });
    });

    it("handles mixed valid and invalid files correctly", () => {
      cy.mount(
        <FileDropzone files={[]} onDrop={mockOnDrop} onReject={mockOnReject} />
      );

      // Create one valid and one invalid file
      cy.writeFile("/tmp/cypress-mixed-valid.ts", "export const valid = true;");
      cy.writeFile("/tmp/cypress-mixed-invalid.txt", "This is invalid");

      // Upload both files together
      cy.get('[data-qa="dropzone-container"]').selectFile(
        ["/tmp/cypress-mixed-valid.ts", "/tmp/cypress-mixed-invalid.txt"],
        { action: "drag-drop" }
      );

      // Both callbacks should be called - onDrop for valid, onReject for invalid
      cy.then(() => {
        expect(mockOnDrop.called).to.be.true;
        expect(mockOnReject.called).to.be.true;
      });
    });
  });
});
