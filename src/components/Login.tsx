import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { userLogin } from "../api";
import CirclePng from "../assets/animate.png";
import { userState } from "../store";

export function Login() {
  const [password, setPassword] = useState("");
  const [account, setAccount] = useState("");
  const navigate = useNavigate();
  const loginCheck = () => {
    console.log("loginCheck");
    if (!account || !password) {
      return;
    }
    userLogin(account, password).then(
      (res) => {
        console.log(res);
        if (!res) {
          alert("账号或密码错误");
          return;
        } else if (res.id !== 0) {
          userState.user = {
            id: res.id,
            name: res.name,
            is_admin: res.is_admin,
          };
          navigate("/");
        } else {
          alert("账号或密码错误");
        }
      },
      (err) => {
        console.log(err);
        alert("账号或密码错误");
      }
    );
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse w-screen">
        <div className="text-center lg:text-left w-1/2">
          <h1 className="text-5xl font-bold text-primary">
            <span>登陆</span>
            <span className="info-animate pl-3 inline-block">
              <div className="relative">
                <div className="text-3xl text-white absolute z-10 inset-0 flex items-center justify-center">
                  A
                </div>
                <img
                  className="animate-[spin_3s_linear_infinite] z-0 inset-0 m-auto inline"
                  src={CirclePng}
                  alt="circle"
                />
              </div>
            </span>
          </h1>
          <p className="text-xl font-semibold py-6">校园班车预约系统</p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form
            className="card-body"
            onSubmit={(e) => {
              e.preventDefault();
              loginCheck();
            }}
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">账号</span>
              </label>
              <input
                id="account"
                type="text"
                placeholder="account"
                className="input input-bordered"
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value);
                }}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">密码</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
              />
              <label className="label">
                <a href="/registry" className="label-text-alt link link-hover">
                  新用户？
                </a>
              </label>
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-neutral btn-outline rounded-none">
                开始唤醒
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
