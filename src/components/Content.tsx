import { useMemo } from "react";

import { mdiFormatListChecks, mdiTicketAccount } from "@mdi/js";
import Icon from "@mdi/react";
import { minidenticon } from "minidenticons";
import { useSnapshot } from "valtio";

import { pageState, titleState, userState } from "../store";

import { MyTicket } from "./MyTicket";
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
  return (
    <div className="page flex-1">
      <div className="page-content h-full">{component}</div>
    </div>
  );
}

function UserInfo() {
  return (
    <div className="justify-start h-full">
      <div className="flex flex-col justify-center h-full">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Page Views</div>
            <div className="stat-value">89,400</div>
            <div className="stat-desc">21% more than last month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
