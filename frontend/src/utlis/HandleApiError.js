import toast from "react-hot-toast";

// Function to handle API errors
export const HandleApiError = (error) => {
  let errorMessage = "An unexpected error occurred.";

  // If the error response exists (i.e., server responded with an error)
  if (error.response) {
    const statusCode = error.response.status;
    const message =
      error.response.data.message || "An error occurred on the server side.";
    const url = error.config?.url || "Unknown URL";

    // Handle specific status codes with custom messages
    switch (statusCode) {
      case 400:
        errorMessage = message || "Bad Request: Check the request parameters.";
        toast.error(errorMessage);
        console.log(
          `Error 400: Bad Request from URL: ${url}`,
          error.response.data
        );
        break;
      case 401:
        errorMessage =
          message || "Unauthorized: You need to log in to continue.";
        toast.error(errorMessage);
        console.log(
          `Error 401: Unauthorized access from URL: ${url}`,
          error.response.data
        );
        break;
      case 403:
        errorMessage =
          message ||
          "Forbidden: You don't have permission to access this resource.";
        toast.error(errorMessage);
        console.log(
          `Error 403: Forbidden from URL: ${url}`,
          error.response.data
        );
        break;
      case 404:
        errorMessage =
          message || "Not Found: The requested resource could not be found.";
        toast.error(errorMessage);
        console.log(
          `Error 404: Not Found for URL: ${url}`,
          error.response.data
        );
        break;
      case 500:
        errorMessage =
          message ||
          "Internal Server Error: Something went wrong on the server.";
        toast.error(errorMessage);
        console.log(
          `Error 500: Internal Server Error from URL: ${url}`,
          error.response.data
        );
        break;
      default:
        errorMessage =
          message || `Error: Something went wrong. Status Code: ${statusCode}`;
        toast.error(errorMessage);
        console.log(
          `Error ${statusCode}: ${message} from URL: ${url}`,
          error.response.data
        );
    }
  }
  // If the error request exists (i.e., the request was made but no response received)
  else if (error.request) {
    errorMessage =
      "No response received from the server. Please check your internet connection or try again later.";
    toast.error(errorMessage);
    console.log("Error: No response received from the server", error.request);
  }
  // If there was an error setting up the request
  else {
    errorMessage = `An error occurred while processing your request: ${error.message}`;
    toast.error(errorMessage);
    console.log("Error: General error in the request setup", error.message);
  }

  return errorMessage;
};
