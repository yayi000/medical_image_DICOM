import React, { Component } from "react";
import styles from '../css/all.module.css';
import axios from "axios";
import List from './list';

class UploadImage extends Component {
  state = {
    file: null,
    patientInfo: null,
    imageSrc: null,

  };

  componentDidMount() {
    this.fileInput.addEventListener("change", this.handleChange);
  }

  handleChange = (event) => {
    if (event.target.files[0]) {
      this.setState({
        file: event.target.files[0],
      });
    }
  };

  uploadFile = async (e) => {
    // // 防止提交
    e.preventDefault();

    const formData = new FormData();
    // 加入檔案
    formData.append("file", this.state.file);

    try {
      const response = await axios.post("http://localhost:8000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("我看一下檔案this.state.file", this.state.file);
      console.log("我看一下檔案formData", formData);

      if (response.data && response.data.patientName) {
        this.setState({ patientInfo: response.data });
      }

      if (response.data && response.data.imageUrl) {
        // 延遲
        setTimeout(() => {
          this.setState({ imageSrc: response.data.imageUrl });
        }, 100);  
      }
    } catch (error) {
      console.error("上傳失敗：", error);
      this.setState({ error: "上傳失敗" });
    }
  };

  render() {
    const { patientInfo } = this.state;
    { console.log("查看:", this.state) }
    return (
      <React.Fragment>
        <div className={styles.upload}>
          <label htmlFor="file">
            <input type="file" id="file" ref={(input) => (this.fileInput = input)} />
          </label>
          <button onClick={this.uploadFile}>上傳</button>

          {patientInfo ? (
            <div>
              <p>病患姓名：{patientInfo.patientName}</p>
              <p>生日：{patientInfo.patientBirthdate}</p>
              <p>年齡：{patientInfo.patientAge}</p>
              <p>性別：{patientInfo.patientSex}</p>
              <p>部位：{patientInfo.bodyPart}</p>
            </div>
          ) : null}

        </div>
        <div>
          <List imageUrl={this.state.imageSrc} />
        </div>
      </React.Fragment>
    );
  }
}

export default UploadImage;