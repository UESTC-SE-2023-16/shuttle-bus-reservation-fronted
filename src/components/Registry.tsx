import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { userRegister } from "../api";
import CirclePng from "../assets/animate.png";

import { Toast } from "./Toast";

export function Registry() {
  const [alertToast, setAlertToast] = useState("");
  const [registered, setRegistered] = useState(false);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = () => {
    console.log("register");
    if (!account || !password) {
      return;
    }
    userRegister(account, password).then(
      (res) => {
        console.log(JSON.stringify(res, null, 2));
        if (!res) {
          setAlertToast("未知错误, 返回为空");
          setAccount("");
          setPassword("");
          return;
        }
        if (res.code === 200) {
          setRegistered(true);
          setAlertToast("注册成功, 3秒后跳转到登陆页面");
          return;
        } else {
          setAlertToast(JSON.stringify(res.data, null, 2));
          setAccount("");
          setPassword("");
          return;
        }
      },
      (err) => {
        console.log(err);
        setAlertToast(`异常${err}`);
        setAccount("");
        setPassword("");
        return;
      }
    );
  };

  useEffect(() => {
    if (registered) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      return;
    }
  }, [registered, navigate]);

  const RToast = () => {
    if (alertToast) {
      if (registered) return <Toast text={alertToast} type="success" />;
      if (alertToast === "正在注册")
        return <Toast text={alertToast} type="info" />;
      else return <Toast text={alertToast} type="error" />;
    }
    return <></>;
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse w-screen">
        <div className="text-center lg:text-left w-1/2">
          <h1 className="text-5xl font-bold text-info">
            <span>注册</span>
            <span className="info-animate pl-3 inline-block">
              <div className="relative">
                <div className="text-3xl text-white absolute z-10 inset-0 flex items-center justify-center">
                  R
                </div>
                <img
                  className="animate-[spin_5s_linear_infinite] z-0 inset-0 m-auto inline"
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
              setAlertToast("正在注册");
              setTimeout(() => {
                register();
              }, 500);
            }}
          >
            <div className="form-control">
              <RToast />
            </div>
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
                <a href="/login" className="label-text-alt link link-hover">
                  已有账号？
                </a>
              </label>
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-accent btn-outline rounded-sm">
                写入数据
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
