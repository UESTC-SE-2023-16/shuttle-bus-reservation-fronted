import { mdiFormatListChecks, mdiTicketAccount } from "@mdi/js";
import Icon from "@mdi/react";
import { useSnapshot } from "valtio";

import userImage from "../assets/user.jpg";
import { pageState, titleState } from "../store";

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
  return (
    <div className="user-card flex flex-col">
      <Avator />
      <div className="user-name pt-1">白面鸮</div>
    </div>
  );
}

function Avator() {
  return (
    <div className="indicator user-avator">
      <span className="indicator-item badge badge-primary">用户</span>
      <div className="avator">
        <div className="w-24">
          <img className="rounded-xl" src={userImage} />
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
      component = <>555</>;
      break;
    default:
      component = <Trip />;
      break;
  }
  return (
    <div className="page flex-1">
      <div className="page-content h-full">{component}</div>
    </div>
  );
}

function UserInfo() {
  return (
    <div className="stats shadow">
      <div className="stat">
        <div className="stat-title">Total Page Views</div>
        <div className="stat-value">89,400</div>
        <div className="stat-desc">21% more than last month</div>
      </div>
    </div>
  );
}
