# REST Client HTTP Requests

This folder contains `.http` files used for testing and interacting with the APIs in this repository. They are designed to be run directly inside Visual Studio Code using the **[REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)** extension.

## Getting Started

1. Install the **REST Client** extension in VS Code.
2. Open any `.http` file in this directory.
3. Click the **"Send Request"** button that appears above the request declaration.

## Syntax & How to Write `.http` Files

### 1. Separation of Requests

Multiple requests in a single file must be separated by three or more hash signs (`###`). This separator also acts as a delimiter, and any comments immediately after it can name the request.

```http
### Get User Profile
GET http://localhost:3000/api/profile

### Create User
POST http://localhost:3000/api/users
```

### 2. File-level Variables

You can define variables at the top of the file using `@variableName = value`. Use them in your requests with double curly braces `{{variableName}}`.

```http
@baseUrl = http://localhost:3000
@token = secret_token_here

###
GET {{baseUrl}}/api/items
Authorization: Bearer {{token}}
```

### 3. Headers and Request Body

Add headers immediately below the request line. To specify a request body, leave **exactly one blank line** after the headers, followed by the payload.

```http
### Create a post
POST {{baseUrl}}/api/posts
Content-Type: application/json

{
  "title": "Hello World",
  "content": "This is a test post"
}
```

### 4. Comments

Use `#` or `//` for single-line comments.

---

For full capabilities, see the [REST Client Documentation](https://github.com/Huachao/vscode-restclient).
