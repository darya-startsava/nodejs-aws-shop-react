import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | null>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const token = localStorage.getItem("authorization_token");
  let headers = {};
  if (token) {
    headers = {
      Authorization: `Basic ${token}`,
    };
  }

  const uploadFile = async () => {
    // Get the presigned URL
    if (!file) {
      return;
    }
    try {
      const response = await fetch(
        url +
          "?" +
          new URLSearchParams({
            name: file.name,
          }),
        {
          headers,
        }
      );
      if (!response.ok) {
        console.log("!response.ok");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response?.json();

      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", data.url);
      const result = await fetch(data.url, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);
      setFile(null);
      if (result.ok) {
        toast.success("Products have been imported");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Error: ", error.message);
        toast.error(
          "Error: Unauthorized access. Please provide valid credentials"
        );
      } else {
        console.log("Error: ", error);
        toast.error("Error: An unexpected error has occurred.");
      }
      return;
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
      <ToastContainer />
    </Box>
  );
}
