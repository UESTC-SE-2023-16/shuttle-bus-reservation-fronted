import { useState } from "react";

import { useSnapshot } from "valtio";

import { updateUserInfo } from "../../api";
import { userState } from "../../store";
import { showGlobalToast } from "../../utils";

export function UserInfo() {
  const user = useSnapshot(userState);
  const [name, setName] = useState(user.user.name);
  const [password, setPassword] = useState("");

  const update = () => {
    if (name === user.user.name && password === "") {
      showGlobalToast("未更改信息", "warning");
      return;
    } else if (name !== user.user.name && password === "") {
      showGlobalToast("用户名变更需要密码确认", "error");
    } else if (name !== user.user.name && password !== "") {
      updateUserInfo(user.user.name, { name, password }).then((res) => {
        if (res) {
          showGlobalToast("更新成功", "success");
          userState.user = {
            ...user.user,
            name: res.name,
          };
        } else {
          showGlobalToast("更新失败", "error");
        }
      });
    } else if (name === user.user.name && password !== "") {
      updateUserInfo(user.user.name, { name, password }).then((res) => {
        if (res) {
          showGlobalToast("更新成功", "success");
        } else {
          showGlobalToast("更新失败", "error");
        }
      });
    } else {
      showGlobalToast("未知错误", "error");
    }
  };

  return (
    <div className="justify-start h-full">
      <div className="flex flex-col justify-center h-full">
        <div className="hero min-h-full bg-base-100">
          <div className="hero-content text-center">
            <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
              <form
                className="card-body w-96"
                onSubmit={(e) => {
                  e.preventDefault();
                  update();
                }}
              >
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">用户名</span>
                  </label>
                  <input
                    type="text"
                    placeholder={name}
                    className="input input-bordered border-t-0 border-x-0 border-b-2 shadow-sm input-primary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">密码</span>
                  </label>
                  <input
                    type="password"
                    placeholder="(未更改)"
                    className="input input-bordered border-t-0 border-x-0 border-b-2 shadow-sm input-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-control mt-6">
                  <button className="btn btn-warning btn-outline rounded-sm">
                    确认变更
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
