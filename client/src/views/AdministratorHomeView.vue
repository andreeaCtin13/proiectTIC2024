<template>
  <div class="administrator">
    <h1 class="titleH1">Administrator Homepage</h1>
    <button class="btn btnImportSectii" @click="uploadSections">
      Import sectii votare
    </button>
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script>
import axios from "../axios";

export default {
  data() {
    return {
      user: "Administrator",
      selectedFile: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadSections() {
      this.$refs.fileInput.click();
    },
    async parseExcelFile(file) {
      const XLSX = await import("xlsx");
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            resolve(rows);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);

        reader.readAsArrayBuffer(file);
      });
    },
    async submitFile() {
      if (!this.selectedFile) {
        alert("Please select a file first.");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.selectedFile);

      try {
        const response = await axios.post(
          "http://localhost:3000/upload-sections",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert(`Upload successful: ${response.data.count} sections imported.`);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload sections.");
      }
    },
  },
  watch: {
    selectedFile() {
      this.submitFile();
    },
  },
};
</script>

<style>
.administrator {
  margin: 2rem;
}

.titleH1 {
  padding: 2rem 0;
}

.btn {
  height: 3rem;
  width: 15rem;
  border-radius: 3rem;
  font-size: 1.3rem;
  transition: 0.3s;
  border: 3px solid var(--var--medium-blue);
}

.btn:hover {
  font-size: 1.4rem;
  transition: 0.3s;
}

.btnImportSectii {
  background-color: var(--var--dark-blue);
  color: white;
}
</style>
