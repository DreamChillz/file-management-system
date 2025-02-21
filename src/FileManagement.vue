<template>
    <div class="file-manager">
        <h2>File Management System</h2>
        <div class="upload-section">
            <!-- Custom label displays fileName -->
            <label for="file-upload" class="file-label">
                {{ fileName || "Choose a file" }}
            </label>
            <input id="file-upload" type="file" @change="handleFileChange" class="hidden-input" />

            <!-- Display selected file name -->
            <div v-if="selectedFile" class="selected-file">
                Selected: {{ selectedFile.name }}
            </div>

            <!-- Upload button triggers upload when clicked -->
            <button @click="uploadFile" :disabled="!selectedFile" class="upload-btn">
                Upload
            </button>
        </div>
        <div class="file-list" v-if="files.length">
            <h3>My Files</h3>
            <table class="files-table">
                <thead>
                    <tr class="table-headings">
                        <th>No</th>
                        <th>File Name</th>
                        <th>File Type</th>
                        <th>Upload Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(file, index) in files" :key="file.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ file.file_name }}</td>
                        <td>{{ file.file_type }}</td>
                        <td>{{ formatDate(file.upload_date) }}</td>
                        <td>
                            <div class="btn-actions">
                                <button @click="deleteFile(file.id)" class="delete-btn">
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import './styles.css';
import dayjs from "dayjs";



const files = ref([]);
const fileName = ref("No file chosen");
const selectedFile = ref(null);

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedFile.value = file;
        fileName.value = file.name;
    } else {
        selectedFile.value = null;
        fileName.value = "No file chosen";
    }
};

const formatDate = (date) => {
    return dayjs(date).format("MMMM DD, YYYY HH:mm A");
}


async function fetchFiles() {
    try {
        const response = await axios.get("http://localhost:3000/files");
        files.value = response.data.files || [];
    } catch (error) {
        console.error("Error fetching files:", error);
    }
}

async function uploadFile() {
    if (!selectedFile.value) return;

    const formData = new FormData();
    // Append the selected file to the FormData object
    formData.append("file", selectedFile.value);

    try {
        await axios.post("http://localhost:3000/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        // Clear selected file after successful upload
        selectedFile.value = null;
        fileName.value = "No file chosen";
        fetchFiles();
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}


async function deleteFile(id) {
    try {
        await axios.delete(`http://localhost:3000/files/${id}`);
        fetchFiles();
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

onMounted(() => {
    fetchFiles();
});
</script>

<style module src="./styles.css"></style>
