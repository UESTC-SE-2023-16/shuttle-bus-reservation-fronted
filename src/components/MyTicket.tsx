import { useState, useEffect, useMemo } from "react";

import { chunk } from "lodash";

import { mdiArrowLeftRightBold, mdiArrowRight } from "@mdi/js";
import Icon from "@mdi/react";
import { useSnapshot } from "valtio";

import { getUserTickets, changeTicketStatus, TICKET_STATUS } from "../api";
import type { Ticket } from "../api";
import BuyCode from "../assets/buy-code.svg";
import { userState } from "../store";

export function MyTicket() {
  const [curPage, setCurPage] = useState(1);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [columnCount, setColumnCount] = useState(3);
  const [rowCount, setrowCount] = useState(3);
  const user = useSnapshot(userState);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const _tickets = await getUserTickets(user.user.id);
      if (isCancelled) return;
      setTickets(_tickets);
    })();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 1280) {
        setColumnCount(1);
      } else if (width < 1540) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
      if (height < 550) {
        setrowCount(1);
      } else if (height < 720) {
        setrowCount(2);
      } else {
        setrowCount(3);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 每页最大的票数
  const capacity = useMemo(
    () => columnCount * rowCount,
    [columnCount, rowCount]
  );

  // 总页数
  const pageCount = useMemo(
    () => Math.ceil(tickets.length / capacity),
    [tickets, capacity]
  );

  // 选出当前页的票
  const tickets_group = useMemo(
    () => chunk(tickets, capacity),
    [tickets, capacity]
  );
  const curTicket = useMemo(
    () => tickets_group[curPage - 1],
    [tickets_group, curPage]
  );

  return (
    <div className="justify-start h-full">
      <div className="flex flex-col justify-between h-full">
        <div className="destinations-info flex w-56 bg-info text-white rounded-br-xl py-3 px-3">
          <span>清水河校区</span>
          <Icon path={mdiArrowLeftRightBold} size={1} />
          <span>沙河校区</span>
        </div>
        <div className="tickets-display flex justify-center">
          <div className="ticket">
            <TicketsDisplay tickets={curTicket} column={columnCount} />
          </div>
        </div>
        <div className="pagination flex justify-center pb-2">
          <Pagination
            curPage={curPage}
            setCurPage={setCurPage}
            totalPage={pageCount}
          />
        </div>
      </div>
      <dialog id={"buy-seat-modal-global"} className="modal">
        <div className="modal-box flex-col justify-center">
          <h3 className="font-bold text-lg text-primary flex justify-center">
            扫描二维码付款
          </h3>
          <div className="flex justify-center py-2">
            <img src={BuyCode} alt="buy code" />
          </div>
          <button
            className="btn btn-block btn-outline btn-error btn-sm"
            onClick={() => {
              const dialog = document.getElementById(
                "buy-seat-modal-global"
              ) as HTMLDialogElement;
              dialog.close();
            }}
          >
            我已付款
          </button>
        </div>
      </dialog>
    </div>
  );
}

function TicketsDisplay({
  tickets,
  column,
}: {
  tickets: Ticket[];
  column: number;
}) {
  const tickets_group = useMemo(
    () => chunk(tickets, column),
    [tickets, column]
  );
  return (
    <div className="tickets-display flex-1">
      {tickets_group.map((tickets, idx) => (
        <div className="ticket flex" key={idx}>
          {tickets.map((ticket) => (
            <TicketCard ticket={ticket} key={ticket.id} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const [newTicket, setNewTicket] = useState(ticket);

  const restColor = (ticket_status: keyof typeof TICKET_STATUS) => {
    switch (ticket_status) {
      case "S":
        return "badge-warning";
      case "N":
        return "badge-info";
      case "F":
        return "badge-accent";
      case "T":
        return "badge-error";
      case "I":
        return "badge-secondary";
      default:
        return "badge-base-content";
    }
  };

  const StatusActionButton = ({
    ticket_status,
  }: {
    ticket_status: keyof typeof TICKET_STATUS;
  }) => {
    let showButtons: [string, string, () => void][] | null = null;
    switch (ticket_status) {
      case "S":
      case "I":
        showButtons = [
          [
            "退票",
            "btn-error",
            () => {
              changeTicketStatus(newTicket.id, "T").then(() => {
                console.log("退票成功");
                setNewTicket((prev) => ({ ...prev, status: "T" }));
              });
            },
          ],
          [
            "付款",
            "btn-success",
            () => {
              changeTicketStatus(newTicket.id, "N").then(() => {
                const dialog = document.getElementById(
                  "buy-seat-modal-global"
                ) as HTMLDialogElement;
                if (dialog) {
                  dialog.showModal();
                }
                console.log("付款成功");
                setNewTicket((prev) => ({ ...prev, status: "N" }));
              });
            },
          ],
        ];
        break;
      case "N":
        showButtons = [
          [
            "退款",
            "btn-warning",
            () => {
              changeTicketStatus(newTicket.id, "T").then(() => {
                console.log("退款成功");
                setNewTicket((prev) => ({ ...prev, status: "T" }));
              });
            },
          ],
        ];
        break;
      default:
        break;
    }
    if (showButtons === null) return <></>;

    const createActionBtn = (
      key: number,
      action: string,
      color: string,
      clickFunc: () => void
    ) => {
      return (
        <button
          key={key}
          className={`btn btn-outline btn-sm ${color}`}
          onClick={clickFunc}
        >
          {action}
        </button>
      );
    };

    const buttons: JSX.Element[] = [];
    showButtons.forEach((button, idx) => {
      buttons.push(createActionBtn(idx, ...button));
    });
    return <>{buttons}</>;
  };

  return (
    <div className="card w-96 bg-neutral text-neutral-content shadow-xl m-1">
      <div className="card-body">
        <h2 className="card-title border-b-2 border-neutral-600 opacity-90">
          <p className="flex">
            <span>{newTicket.bus_info.depart}</span>
            <Icon path={mdiArrowRight} size={1} />
            <span>{newTicket.bus_info.destination}</span>
          </p>
          <div className={`badge ${restColor(newTicket.status)}`}>
            {TICKET_STATUS[newTicket.status]}
          </div>
        </h2>
        <div className="flex justify-between">
          <span>{`车次：${newTicket.bus_info.busnum}`}</span>
          <span>{`票价：${newTicket.bus_info.fare}¥`}</span>
        </div>
        <p>{`发车时间：${newTicket.bus_info.departtime}`}</p>
        <div className="card-actions justify-end">
          <StatusActionButton ticket_status={newTicket.status} />
        </div>
      </div>
    </div>
  );
}

function Pagination({
  curPage,
  setCurPage,
  totalPage,
}: {
  curPage: number;
  setCurPage: (page: number) => void;
  totalPage: number;
}) {
  if (totalPage <= 1) {
    return <></>;
  }

  const activeClass = "btn btn-active";

  const selectPage = (page: number) => {
    if (page < 1 || page > totalPage) return;
    setCurPage(page);
  };

  return (
    <div className="join">
      {Array.from({ length: totalPage }, (_, idx) => idx + 1).map((page) => (
        <button
          className={`join-item btn ${page === curPage ? activeClass : ""}`}
          onClick={() => selectPage(page)}
          key={page}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
