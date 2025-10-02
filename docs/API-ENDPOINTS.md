# API Endpoints Documentation

## Base URL

```
http://localhost:3000/api
```

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Upload Endpoints](#upload-endpoints)
4. [File Endpoints](#file-endpoints)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)

---

## Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Validation Requirements:**

- `username`: String, alphanumeric, 3-30 characters (required)
- `email`: Valid email format (required)
- `password`: String, minimum 6 characters (required)
- `role`: "user" or "admin" (optional, defaults to "user")

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

**Error Responses:**

- **400 Bad Request:** Invalid input data

```json
{
  "success": false,
  "message": "\"username\" must only contain alpha-numeric characters"
}
```

- **409 Conflict:** User already exists

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Code Snippet:**

```javascript
// controllers/auth.controller.js
const { error, value } = validate(userSchema, req.body);
if (error) {
  throw CustomError(400, error.details[0].message);
}

const hashedPassword = await bcrypt.hash(password, 12);
const newUser = await User.create({
  ...value,
  password: hashedPassword,
});
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Requirements:**

- `email`: Valid email format (required)
- `password`: String, minimum 6 characters (required)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "profileImage": null,
      "lastLogin": "2025-10-02T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request:** Invalid input

```json
{
  "success": false,
  "message": "\"email\" must be a valid email"
}
```

- **401 Unauthorized:** Invalid credentials

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

- **403 Forbidden:** Account inactive

```json
{
  "success": false,
  "message": "User account is inactive or deleted"
}
```

**Code Snippet:**

```javascript
// controllers/auth.controller.js
const user = await User.findOne({ email });
const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
  throw CustomError(401, "Invalid email or password");
}

const token = generateToken({ userId: user._id, role: user.role });
```

---

## User Endpoints

### 3. Get Current User

**Endpoint:** `GET /api/user/current`

**Description:** Get current authenticated user's information

**Authentication:** Required (Bearer Token)

**Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "lastLogin": "2025-10-02T10:30:00.000Z",
      "profileImage": null,
      "isDeleted": false,
      "createdAt": "2025-09-01T08:00:00.000Z",
      "updatedAt": "2025-10-02T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

- **401 Unauthorized:** Missing or invalid token

```json
{
  "success": false,
  "message": "Not authorized, token missing"
}
```

- **404 Not Found:** User not found

```json
{
  "success": false,
  "message": "User not found"
}
```

**Code Snippet:**

```javascript
// controllers/user.controller.js
const { id } = req.user;
const user = await User.findById(id).select("-password __v");

if (!user) {
  throw CustomError(404, "User not found");
}
```

---

## Upload Endpoints

### 4. Upload Files

**Endpoint:** `POST /api/upload`

**Description:** Upload multiple files, extract text, generate metadata, and rename files automatically

**Authentication:** Not required (but can be added)

**Headers:**

```json
{
  "Content-Type": "multipart/form-data"
}
```

**Request Body (multipart/form-data):**

```
files: [File, File, ...] (array of files)
template: "{Client}_{SubClient}_{DocType}_{Issuer}_{Date}_{Period}_{Ref}.{extentionname}"
totalFiles: 3
clientName: "ACME Corp"
subClientName: "Tech Division" (optional)
```

**Form Fields:**

- `files`: Array of files (PDF or images) - Max 5MB per file
- `template`: String, naming template (required)
- `totalFiles`: Number, integer, minimum 1 (required)
- `clientName`: String (required)
- `subClientName`: String (optional)

**Supported File Types:**

- PDF: `application/pdf`
- Images: `image/jpeg`, `image/png`, etc.

**File Size Limit:** 5MB per file

**Success Response (200):**

```json
{
  "success": true,
  "message": "Files uploaded and processed successfully",
  "data": {
    "number": 3,
    "files": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "originalName": "document1.pdf",
        "newName": "ACMECorp_TechDivision_Payslip_ANZ_2024-01_2024-01to2024-03_REF123.pdf",
        "size": 245678,
        "contentType": "application/pdf",
        "key": "uploads/1696234567890-document1.pdf",
        "status": "processed",
        "confidenceScore": 0.85,
        "review": false,
        "createdAt": "2025-10-02T10:30:00.000Z",
        "updatedAt": "2025-10-02T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "originalName": "statement.pdf",
        "newName": "ACMECorp_TechDivision_BankStatement_Westpac_2024-02_NoRef.pdf",
        "size": 187432,
        "contentType": "application/pdf",
        "key": "uploads/1696234567891-statement.pdf",
        "status": "processed",
        "confidenceScore": 0.75,
        "review": true,
        "createdAt": "2025-10-02T10:30:00.000Z",
        "updatedAt": "2025-10-02T10:30:00.000Z"
      }
    ]
  }
}
```

**Metadata Extraction Fields:**

- `client`: Client name from request
- `subClientName`: Sub-client name from request
- `docType`: Detected document type (Payslip, BankStatement, TaxReturn, ID)
- `issuer`: Detected issuer/bank name (ANZ, Westpac, NAB, etc.)
- `date`: Extracted date
- `period`: Extracted date range
- `ref`: Reference number
- `confidenceScore`: Overall confidence (0-1)
- `review`: True if confidence < 0.8

**Processing Flow:**

1. Upload files to AWS S3
2. Extract text using PDF-Parse (for PDFs)
3. Fallback to AWS Textract if no text found
4. Extract metadata using regex patterns
5. Generate new filename from template
6. Save to MongoDB with metadata

**Error Responses:**

- **400 Bad Request:** Invalid input or file type

```json
{
  "success": false,
  "message": "Unsupported file uploaded: document.txt"
}
```

```json
{
  "success": false,
  "message": "File size exceeds limit (5MB): largefile.pdf"
}
```

```json
{
  "success": false,
  "message": "No files uploaded"
}
```

**Code Snippet:**

```javascript
// controllers/upload.controller.js
const uploadedFiles = await Promise.all(
  files.map(async (file) => {
    const fileData = {
      name: file.originalname,
      contentType: file.mimetype,
      body: file.buffer,
    };

    const { key } = await uploadFile(fileData);
    return { key, originalName: file.originalname, ... };
  })
);

for (const file of uploadedFiles) {
  let extractedText = await parsePDF(file.body);

  if (!extractedText) {
    extractedText = file.contentType === "application/pdf"
      ? await processPdf(file.key)
      : await processImage(file.key);
  }

  const metadata = extractMetadata(extractedText, { ...value, fileExtension });
  const newName = generateFileName(template, metadata);

  processedFiles.push({
    fileKey: file.key,
    newName,
    confidenceScore: metadata.totalConfidence,
    review: metadata.totalConfidence < 0.8
  });
}

const finalFiles = await File.insertMany(processedFiles);
```

---

## File Endpoints

### 5. Rename File

**Endpoint:** `PUT /api/file/:fileID`

**Description:** Manually rename a specific file

**Authentication:** Not required (but can be added)

**URL Parameters:**

- `fileID`: MongoDB ObjectId of the file

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "newName": "UpdatedFileName.pdf",
  "oldName": "OldFileName.pdf"
}
```

**Validation Requirements:**

- `newName`: String, 1-255 characters (required)
- `oldName`: String, 1-255 characters (required)

**Success Response (200):**

```json
{
  "success": true,
  "message": "File renamed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "originalName": "document1.pdf",
    "newName": "UpdatedFileName.pdf",
    "size": 245678,
    "contentType": "application/pdf",
    "key": "uploads/1696234567890-document1.pdf",
    "status": "processed",
    "confidenceScore": 0.85,
    "review": false,
    "createdAt": "2025-10-02T10:30:00.000Z",
    "updatedAt": "2025-10-02T10:35:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request:** Invalid input

```json
{
  "success": false,
  "message": "\"newName\" is required"
}
```

- **404 Not Found:** File not found

```json
{
  "success": false,
  "message": "File not found"
}
```

**Code Snippet:**

```javascript
// controllers/file.controller.js
const { value, error } = validate(renameSchema, req.body);
if (error) throw CustomError(400, error.details[0].message);

const { newName } = value;
const updatedFile = await File.findByIdAndUpdate(
  fileID,
  { newName },
  { new: true }
);

if (!updatedFile) throw CustomError(404, "File not found");
```

---

### 6. Download Files (Batch)

**Endpoint:** `POST /api/file/download` _(Note: This endpoint is implemented in the code but not registered in routes)_

**Description:** Download multiple files as a ZIP archive and delete them after download

**Authentication:** Not required (but can be added)

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "files": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**Validation Requirements:**

- `files`: Array of MongoDB ObjectIds, minimum 1 item (required)

**Success Response (200):**
Returns a ZIP file stream with:

- **Content-Type:** `application/zip`
- **Content-Disposition:** `attachment; filename=documents.zip`

**Post-Download Actions:**

1. Files are deleted from MongoDB
2. Files are deleted from AWS S3

**Error Responses:**

- **400 Bad Request:** Invalid input

```json
{
  "success": false,
  "message": "\"files\" is required"
}
```

- **404 Not Found:** No files found

```json
{
  "success": false,
  "message": "No files found"
}
```

**Code Snippet:**

```javascript
// controllers/file.controller.js
const { files } = value;
const fileRecords = await File.find({ _id: { $in: files } });

res.setHeader("Content-Type", "application/zip");
res.setHeader("Content-Disposition", "attachment; filename=documents.zip");

const archive = archiver("zip", { zlib: { level: 9 } });
archive.pipe(res);

for (const record of fileRecords) {
  const fileStream = await S3Service.getFileStream(record.key);
  archive.append(fileStream, {
    name: record.newName || record.originalName,
  });
}

archive.finalize();

archive.on("end", async () => {
  await File.deleteMany({ _id: { $in: files } });
  const keys = fileRecords.map((rec) => rec.key).filter(Boolean);
  if (keys.length > 0) {
    await S3Service.deleteFiles(keys);
  }
});
```

---

## Response Format

### Success Response Structure

```json
{
  "success": true,
  "message": "Descriptive success message",
  "data": {
    // Response data
  }
}
```

### Error Response Structure

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

---

## Error Handling

### Common Error Codes

| Status Code | Description           | Example                                         |
| ----------- | --------------------- | ----------------------------------------------- |
| 400         | Bad Request           | Invalid input data, validation errors           |
| 401         | Unauthorized          | Missing or invalid token                        |
| 403         | Forbidden             | Insufficient permissions, inactive account      |
| 404         | Not Found             | Resource not found                              |
| 409         | Conflict              | Duplicate resource (e.g., email already exists) |
| 500         | Internal Server Error | Server-side errors, AWS errors                  |

### Error Middleware

All errors are handled by a centralized error middleware:

```javascript
// middlewares/error.middleware.js
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";

  // HTTP errors
  if (error.status) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  // Validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400;
    errorMessage = error.message;
  }
  // MongoDB duplicate key
  else if (error.code === 11000) {
    statusCode = 400;
    errorMessage = "Duplicate field value entered";
  }
  // JWT errors
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    errorMessage = "Invalid token";
  }

  res.status(statusCode).json(new APIError(errorMessage));
};
```

---

## Authentication Flow

### JWT Token

- **Generation:** On successful login
- **Expiration:** 24 hours
- **Usage:** Include in Authorization header as `Bearer <token>`

```javascript
// utils/token.js
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "24h",
  });
};
```

### Protected Routes

Routes requiring authentication use the `protect` middleware:

```javascript
// middlewares/auth.middleware.js
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw CustomError(401, "Not authorized, token missing");
  }

  const decoded = verifyToken(token);
  req.user = decoded;
  next();
};
```

---

## Database Models

### User Model

```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  role: String (enum: ["admin", "user"], default: "user"),
  isActive: Boolean (default: true),
  lastLogin: Date (default: null),
  profileImage: String (default: null),
  isDeleted: Boolean (default: false),
  timestamps: true
}
```

### File Model

```javascript
{
  originalName: String (required),
  newName: String (required),
  size: Number (required),
  contentType: String (required),
  key: String (S3 key, default: null),
  status: String (enum: ["pending", "processed", "failed"], default: "pending"),
  confidenceScore: Number (default: null),
  review: Boolean (default: false),
  timestamps: true
}
```

---

## Metadata Extraction

### Supported Patterns

**Date Detection:**

- `YYYY-MM` or `MM-YYYY`
- `Jan 2024`, `February 2024`, etc.

**Period Detection:**

- `YYYY-MM to YYYY-MM`
- `2024-01-2024-03`

**Issuer Detection:**

- Banks: ANZ, Westpac, NAB, Commonwealth, CBA, AMP, Macquarie, HSBC, Citibank, Suncorp, ING, St. George, Bank of Melbourne

**Document Type Detection:**

- Payslip
- BankStatement
- TaxReturn
- ID (Passport, Driver's License)

**Confidence Score:**

- Ranges from -0.2 to 1.0 per field
- Overall confidence is the average
- Files with confidence < 0.8 are flagged for review

---

## File Naming Template

### Template Syntax

```
{Client}_{SubClient}_{DocType}_{Issuer}_{Date}_{Period}_{Ref}.{extentionname}
```

### Example

**Template:**

```
{Client}_{SubClient}_{DocType}_{Issuer}_{Date}.{extentionname}
```

**Generated Name:**

```
ACMECorp_TechDivision_Payslip_ANZ_2024-01.pdf
```

### Sanitization

- Removes special characters: `/\?%*:|"<>`
- Removes whitespace
- Handles missing values with defaults (UnknownClient, UnknownDoc, etc.)

---

## AWS Integration

### S3 Storage

- Files are uploaded to S3 with unique keys
- Format: `uploads/{timestamp}-{originalname}`
- Files are deleted after successful download

### AWS Textract

- Used as fallback when PDF-Parse fails
- Supports both images and PDFs
- For PDFs: Uses async job processing (polls every 3 seconds)
- Extracts text from LINE blocks

---

## Environment Variables

Required environment variables:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/broker-file-renaming
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-bucket-name
```

---

## Testing Examples

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get Current User

```bash
curl -X GET http://localhost:3000/api/user/current \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Upload Files

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.pdf" \
  -F "template={Client}_{DocType}_{Date}.{extentionname}" \
  -F "totalFiles=2" \
  -F "clientName=ACME Corp" \
  -F "subClientName=Tech Division"
```

### 5. Rename File

```bash
curl -X PUT http://localhost:3000/api/file/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "newName": "NewFileName.pdf",
    "oldName": "OldFileName.pdf"
  }'
```

---

## Notes

1. **Download Endpoint Missing:** The `downloadFiles` function exists in `file.controller.js` but is not registered in `file.routes.js`. You need to add it:

   ```javascript
   fileRouter.post("/download", downloadFiles);
   ```

2. **Authentication:** Currently, only the `/api/user/*` routes require authentication. Consider adding authentication to upload and file routes if needed.

3. **File Size Limit:** Maximum file size is 5MB per file.

4. **Supported File Types:** Only PDFs and images are supported.

5. **Confidence Threshold:** Files with confidence score < 0.8 are automatically flagged for review.

6. **S3 Cleanup:** Files are automatically deleted from S3 after download.

---

## License

ISC

## Repository

https://github.com/0vai5/BrokerFileRenamingTool-BackEnd
