import React, { Component } from "react";
import styles from '../css/all.module.css';


class List extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      labels: [],
      tempPoints: [],
      editingLabel: null,
      labelCounter: 1, // label項目初始值

    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.imageUrl !== prevProps.imageUrl) {
      this.loadImage(this.props.imageUrl);
    }
  }

  loadImage = (src) => {
    const img = new Image();
    img.onload = () => {
      const ctx = this.canvasRef.current.getContext("2d");
      // 設定canvas寬度為圖片寬高
      this.canvasRef.current.width = img.width;
      this.canvasRef.current.height = img.height;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      // 確保圖片載入後再繪製標籤
      this.updateCanvas();
    };
    img.src = src;
  }

  // 更新
  updateCanvas() {
    const ctx = this.canvasRef.current.getContext("2d");
    this.state.labels.forEach((label) => {
      ctx.beginPath();
      ctx.moveTo(label.points[0].x, label.points[0].y);
      for (let i = 1; i < label.points.length; i++) {
        ctx.lineTo(label.points[i].x, label.points[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 5;        // 線條粗度
      ctx.stroke();
      ctx.fillStyle = 'blue';
      ctx.fill();

    });
  }

  // 新增點 得到座標並更新
  addPoint = (event) => {
    const rect = this.canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.setState(prevState => ({
      tempPoints: [...prevState.tempPoints, { x, y }],
    }));
  };

  // 新增項目
  addLabel = () => {
    // 新增項目ID
    const newLabelId = this.state.labelCounter;
    this.setState(
      (prevState) => ({
        labels: [...prevState.labels, { id: newLabelId, points: [...prevState.tempPoints] }],
        tempPoints: [],
        // label項目值加1
        labelCounter: prevState.labelCounter + 1,
      }),
      () => {
        this.updateCanvas();
      }
    );
  }

  // 編輯
  editLabel = (id) => {
    const label = this.state.labels.find((l) => l.id === id);
    this.setState({
      editingLabel: id,
      tempPoints: [...label.points],
    }, () => {
      this.canvasRef.current.addEventListener('click', this.addPoint);
    });
  };

  // 儲存編輯
  saveEdit = () => {
    this.canvasRef.current.removeEventListener('click', this.addPoint);
    this.setState(
      (prevState) => ({
        labels: prevState.labels.map((l) =>
          l.id === prevState.editingLabel ? { id: l.id, points: [...prevState.tempPoints] } : l
        ),
        tempPoints: [],
        editingLabel: null,
      }),
      () => {
        this.updateCanvas();
      }
    );
  };

  // 刪除
  deleteLabel = (id) => {
    this.setState(
      {
        // 刪除指定的label
        labels: this.state.labels.filter((l) => l.id !== id),
      },
      () => {
        this.canvasRef.current.getContext("2d");
        // 重新將image載入到 canvas 上
        this.loadImage(this.props.imageUrl);
        this.updateCanvas();
      }
    );
  };


  render() {
    return (
      <React.Fragment>

        <div className={styles.label}>
          <canvas id="dicomCanvas"
            ref={this.canvasRef}
            onClick={this.addPoint}

          ></canvas>
          <div className={styles.tools}>
            <h3>Label Tools</h3>
            {this.state.editingLabel === null ? (
              <button onClick={this.addLabel}>Add</button>
            ) : (
              <button onClick={this.saveEdit}>Save Edit</button>
            )}
            <div className={styles.list}>
              <h3>Label List</h3>
              {this.state.labels.map((label) => (
                <div key={label.id}>
                  ．label {label.id}{" "}
                  <button className={styles.btn} onClick={() => this.editLabel(label.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />

                    </svg>
                  </button>
                  <button className={styles.btn} onClick={() => this.deleteLabel(label.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </React.Fragment>
    );
  }
}

export default List;