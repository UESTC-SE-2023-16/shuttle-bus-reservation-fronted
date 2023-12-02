import { mdiFormatListChecks, mdiTicketAccount } from "@mdi/js";
import Icon from "@mdi/react";

import userImage from "./assets/user.jpg";

export function Content() {
  return (
    <>
      <SideBar />
    </>
  );
}

function SideBar() {
  return (
    <ul className="menu bg-base-200 w-56 rounded-box">
      <li>
        <UserCard />
      </li>
      <li>
        <span className="flex justify-center">
          <Icon path={mdiFormatListChecks} size={1} />
          <a>行程预约</a>
        </span>
      </li>
      <li>
        <span className="flex justify-center">
          <Icon path={mdiTicketAccount} size={1} />
          <a>我的订单</a>
        </span>
      </li>
    </ul>
  );
}

function UserCard() {
  return (
    <div className="user-card flex flex-col">
      <Avator />
      <div className="user-name">白面鸮</div>
    </div>
  );
}

function Avator() {
  return (
    <div className="indicator user-avator">
      <span className="indicator-item badge badge-primary">用户</span>
      <div className="avator">
        <div className="w-24 rounded-full">
          <img src={userImage} />
        </div>
      </div>
    </div>
  );
}
