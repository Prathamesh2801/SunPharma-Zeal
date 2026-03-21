import axios from "axios";
import { BASE_URL } from "../../config";

export const submitToAPI = async ({ fullName, comment, image }) => {
  const formData = new FormData();

  formData.append("Name", fullName);
  formData.append("Comment", comment);
  formData.append("image", image);

  try {
    const res = await axios.post(`${BASE_URL}/sse_api.php`, formData, {
      validateStatus: (s) => s >= 200 && s < 500,
    });

    const data = {
      fullName,
      comment,
      filePath: BASE_URL + "/" + res.data.file_result.file_path,
      fileName: res.data.file_result.file_name,
    };

    if (res.status === 200 && res.data?.status === "success") {
      return {
        success: true,
        data,
      };
    }

    return { success: false };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const updateUserImage = async (filename) => {
  try {
    const res = await axios.put(`${BASE_URL}/sse_api.php`, {
      filename: filename,
    });

    console.log("Swipe  : ", res.data);
    return res.data;
  } catch (err) {
    console.error("Update API error:", err);
    throw err;
  }
};
