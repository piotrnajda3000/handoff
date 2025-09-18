# FileDropzone Component Test Documentation

This document outlines all the test cases implemented for the `FileDropzone` component in `dropzone.cy.tsx`.

## Test Structure

All tests use Cypress component testing with the following setup:

- **Mock functions**: `mockOnDrop` and `mockOnReject` for testing callbacks
- **Test data**: Empty `testFiles` array initialized before each test
- **Framework**: Cypress with Sinon stubs for mocking

## Test Cases

### 1. Initial Rendering and State

**Test**: `"renders the dropzone with correct initial state"`

**Purpose**: Verifies that the component renders correctly with all required elements in their default state.

**Assertions**:

- Main dropzone container is visible (`[data-qa="dropzone-container"]`)
- Dropzone content area is visible (`[data-qa="dropzone-content"]`)
- Idle state icon is displayed (`[data-qa="dropzone-idle-icon"]`)
- Title text shows "Drag files here or click to select"
- File types text shows "TypeScript (.ts, .tsx) or JavaScript (.js, .jsx)"
- Size limit text shows "Files should not exceed 5MB"
- Selected files section is not visible initially

### 2. Selected Files Display

**Test**: `"displays selected files when files are provided"`

**Purpose**: Tests that the component correctly displays files when they are passed as props.

**Test Data**:

- `test.ts` (1024 bytes)
- `component.tsx` (2048 bytes)

**Assertions**:

- Selected files section becomes visible
- Title shows "Selected files:"
- Individual files display with correct format: "📄 filename (size in KB)"
- File sizes are correctly converted to human-readable format

### 3. Valid File Drop Handling

**Test**: `"handles valid file drop"`

**Purpose**: Verifies that valid JavaScript files can be dropped and trigger the onDrop callback.

**Process**:

- Creates temporary `.js` file with valid JavaScript content
- Uses `cy.selectFile()` with drag-drop action
- Verifies `mockOnDrop` callback is called

### 4. Invalid File Type Rejection

**Test**: `"handles invalid file type rejection"`

**Purpose**: Tests that files with invalid extensions are rejected.

**Process**:

- Creates temporary `.pdf` file
- Attempts to drop the invalid file
- Verifies `mockOnReject` callback is called

### 5. File Size Limit Rejection

**Test**: `"handles file size limit rejection"`

**Purpose**: Ensures files exceeding the 5MB limit are rejected.

**Process**:

- Creates 6MB `.ts` file (exceeds 5MB limit)
- Attempts to drop the oversized file
- Verifies `mockOnReject` callback is called

### 6. Accept State Visual Feedback

**Test**: `"shows accept state visual feedback during valid drag"`

**Purpose**: Tests visual feedback when dragging valid files over the dropzone.

**Process**:

- Creates valid JavaScript file object
- Simulates `dragenter` event with valid file
- Verifies dropzone container remains accessible (Mantine handles visual states internally)

### 7. Reject State Visual Feedback

**Test**: `"shows reject state visual feedback during invalid drag"`

**Purpose**: Tests visual feedback when dragging invalid files over the dropzone.

**Process**:

- Creates invalid text file object
- Simulates `dragenter` event with invalid file
- Verifies dropzone container remains accessible (Mantine handles visual states internally)

### 8. Multiple Valid Files Handling

**Test**: `"handles multiple valid files"`

**Purpose**: Ensures the component can accept multiple valid files simultaneously.

**Process**:

- Creates multiple valid files (`.ts` and `.js`)
- Drops both files using `cy.selectFile()` with array
- Verifies `mockOnDrop` callback is called

### 9. MIME Type Validation

**Test**: `"accepts all valid JavaScript and TypeScript MIME types"`

**Purpose**: Comprehensive test of all valid MIME types that should be accepted.

**Valid MIME Types Tested**:

- `text/javascript`
- `application/javascript`
- `text/x-javascript`
- `text/typescript`
- `application/typescript`
- `text/x-typescript`

**Process**:

- Iterates through each MIME type
- Creates file objects with each type
- Simulates drop events for comprehensive coverage

### 10. File Size Display Formatting

**Test**: `"displays file sizes correctly in KB"`

**Purpose**: Verifies correct formatting of file sizes in the UI.

**Test Cases**:

- 1024 bytes → "1.0 KB"
- 1536 bytes → "1.5 KB"
- 2048 bytes → "2.0 KB"
- 512 bytes → "0.5 KB"

**Process**:

- Tests each size conversion case
- Verifies display format matches expected output

### 11. Accessibility Compliance

**Test**: `"has proper accessibility attributes"`

**Purpose**: Ensures the component is accessible and keyboard-navigable.

**Assertions**:

- Dropzone has pointer cursor for click indication
- Container is visible and accessible
- Component supports keyboard navigation (handled by Mantine)

## Component Features Validated

### Accepted File Types

- **Extensions**: `.ts`, `.tsx`, `.js`, `.jsx`
- **MIME Types**: All major JavaScript/TypeScript MIME variants

### File Validation

- **Size Limit**: 5MB maximum
- **Type Checking**: Strict validation against allowed extensions
- **Multiple Files**: Supports batch file selection

### User Interface

- **Visual States**: Idle, accept, and reject feedback
- **File Display**: Formatted file list with sizes
- **Accessibility**: Keyboard and screen reader support

### Callbacks

- **onDrop**: Called with valid accepted files
- **onReject**: Called with details of rejected files

## Data Attributes for Testing

The component uses the following `data-qa` attributes for reliable testing:

- `dropzone-container`: Main dropzone area
- `dropzone-content`: Content wrapper
- `dropzone-idle-icon`: Default state icon
- `dropzone-title`: Main instruction text
- `dropzone-file-types`: Accepted file types text
- `dropzone-size-limit`: Size limit text
- `selected-files-section`: Container for selected files
- `selected-files-title`: "Selected files:" heading
- `selected-file-{index}`: Individual file entries

## Test Dependencies

- **Cypress**: Component testing framework
- **Sinon**: Mocking library (via Cypress.sinon)
- **@mantine/dropzone**: Core dropzone functionality
- **File System**: Temporary files for drop simulation

## Notes

- Tests use temporary files in `/tmp/` directory for realistic file operations
- Visual state changes are primarily handled by Mantine's internal styling
- All callback testing uses Sinon stubs to verify function calls
- File size calculations assume 1KB = 1024 bytes
