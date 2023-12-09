import { useMemo, useState } from "react";

import { mdiFormatListChecks, mdiTicketAccount } from "@mdi/js";
import Icon from "@mdi/react";
import { minidenticon } from "minidenticons";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";

import { updateUserInfo } from "../api";
import { pageState, titleState, userState, globalToastState } from "../store";
import { showGlobalToast } from "../utils";

import { MyTicket } from "./MyTicket";
import { Toast } from "./Toast";
import { Trip } from "./Trip";

export function Content() {
  return (
    <div className="flex h-full w-full">
      <SideBar />
      <Page />
    </div>
  );
}

function SideBar() {
  return (
    <div className="sidebar h-full w-56 bg-base-200 min-w-fit">
      <ul className="menu rounded-box">
        <li className="pt-10 pb-10" onClick={pageSwitch("我的信息")}>
          <UserCard />
        </li>
        <li className="pl-8" onClick={pageSwitch("行程预约")}>
          <span className="flex">
            <Icon path={mdiFormatListChecks} size={1} />
            <a>行程预约</a>
          </span>
        </li>
        <li className="pl-8" onClick={pageSwitch("我的订单")}>
          <span className="flex">
            <Icon path={mdiTicketAccount} size={1} />
            <a>我的订单</a>
          </span>
        </li>
      </ul>
    </div>
  );
}

function UserCard() {
  const user = useSnapshot(userState);
  return (
    <div className="user-card flex flex-col">
      <Avator user={user.user} />
      <div className="user-name pt-1">{user.user.name}</div>
    </div>
  );
}

function Avator({ user }: { user: typeof userState.user }) {
  const badge = user.is_admin ? "管理员" : "用户";
  const svgURI = useMemo(
    () =>
      "data:image/svg+xml;utf8," + encodeURIComponent(minidenticon(user.name)),
    [user]
  );

  return (
    <div className="indicator user-avator">
      <span className="indicator-item badge badge-primary">{badge}</span>
      <div className="avator">
        <div className="w-24 border border-neutral rounded-xl">
          <img className="rounded-xl" src={svgURI} />
        </div>
      </div>
    </div>
  );
}

function pageSwitch(pageName: string, title: string | null = null) {
  return () => {
    pageState.currentPage = pageName;
    titleState.title = title !== null ? title : pageName;
  };
}

// 按照点击的不同，切换不同的页面
// 默认是行程预约
function Page() {
  const globalToast = useSnapshot(globalToastState);
  const state = useSnapshot(pageState);
  let component = <></>;
  switch (state.currentPage) {
    case "我的信息":
      component = <UserInfo />;
      break;
    case "行程预约":
      component = <Trip />;
      break;
    case "我的订单":
      component = <MyTicket />;
      break;
    default:
      component = <Trip />;
      break;
  }

  const GToast = () => {
    if (globalToast.text) {
      return (
        <Toast
          text={globalToast.text}
          className="absolute top-50 right-0 z-50 w-1/5"
          type={globalToast.type}
        />
      );
    }
  };

  return (
    <div className="page flex-1">
      <GToast />
      <div className="page-content h-full">{component}</div>
    </div>
  );
}

function UserInfo() {
  const user = useSnapshot(userState);
  const [name, setName] = useState(user.user.name);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
            id: 0,
            name: "",
            is_admin: false,
            token: "",
          };
          navigate("/login");
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
