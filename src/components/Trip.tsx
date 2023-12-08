import { useState, useEffect, useMemo } from "react";

import { chunk } from "lodash";

import {
  mdiArrowLeftRightBold,
  mdiArrowRight,
  mdiMenuLeftOutline,
  mdiMenuRightOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useSnapshot } from "valtio";

import { getBusBangos, buyBusBangoTicket, changeTicketStatus } from "../api";
import type { BusBango } from "../api";
import BuyCode from "../assets/buy-code.svg";
import { userState } from "../store";

export function Trip() {
  // 当前页数
  const [curPage, setCurPage] = useState(1);
  // 总的票
  const [tickets, setTickets] = useState<BusBango[]>([]);
  // 每页列数
  const [columnCount, setColumnCount] = useState(3);
  // 每页行数
  const [rowCount, setrowCount] = useState(3);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const _tickets = await getBusBangos();
      if (isCancelled || !_tickets) return;
      setTickets(_tickets);
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

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
    </div>
  );
}

function TicketsDisplay({
  tickets,
  column,
}: {
  tickets: BusBango[];
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
            <TicketCard busBango={ticket} key={ticket.id} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TicketCard({ busBango }: { busBango: BusBango }) {
  const [remainedSeats, setRemainedSeats] = useState(busBango.remained_seats);

  const restColor = (busBango: BusBango) => {
    const restRate = busBango.remained_seats / busBango.seats;
    if (restRate <= 0.2) {
      return "badge-error";
    } else if (restRate <= 0.5) {
      return "badge-warning";
    } else {
      return "badge-info";
    }
  };

  return (
    <div className="card w-96 bg-neutral text-neutral-content shadow-xl m-1">
      <div className="card-body">
        <h2 className="card-title border-b-2 border-neutral-600 opacity-90">
          <p className="flex">
            <span>{busBango.depart}</span>
            <Icon path={mdiArrowRight} size={1} />
            <span>{busBango.destination}</span>
          </p>
          <div
            className={`badge ${restColor(busBango)}`}
          >{`剩余 ${remainedSeats}`}</div>
        </h2>
        <div className="flex justify-between">
          <span>{`车次：${busBango.busnum}`}</span>
          <span>{`票价：${busBango.fare}¥`}</span>
        </div>
        <p>{`发车时间：${busBango.departtime}`}</p>
        <div className="card-actions justify-end">
          <button
            className={`btn btn-outline btn-primary btn-sm ${
              remainedSeats <= 0 ? "btn-disabled" : ""
            }`}
            onClick={createModalPopFunc(`select-seat-modal-${busBango.id}`)}
          >
            选座
          </button>
        </div>
        <SelectSeatModal
          key={busBango.id}
          bango={busBango}
          setRemainedSeats={setRemainedSeats}
        />
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

function SelectSeatModal({
  bango,
  setRemainedSeats,
}: {
  bango: BusBango;
  setRemainedSeats: (seats: number) => void;
}) {
  const [buyCount, setBuyCount] = useState(1);
  const [buyTicketIds, setBuyTicketIds] = useState<number[]>([]);
  const user = useSnapshot(userState);

  const handleBuyCountChange = (action: "add" | "sub") => {
    switch (action) {
      case "add":
        if (buyCount < bango.remained_seats) {
          setBuyCount(buyCount + 1);
          return true;
        }
        return false;
      case "sub":
        if (buyCount > 1) {
          setBuyCount(buyCount - 1);
          return true;
        }
        return false;
    }
  };

  return (
    <dialog id={`select-seat-modal-${bango.id}`} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">
          <span>购买</span>
          <span className="text-primary">{` 车次：${bango.busnum}`}</span>
        </h3>
        <div className="pt-4">
          <div className="card w-full bg-base-100">
            <div className="card-body">
              <h4 className="card-title font-bold text-lg">
                <span>{bango.depart}</span>
                <Icon path={mdiArrowRight} size={1} />
                <span>{bango.destination}</span>
              </h4>
              <p>{`发车时间：${bango.departtime}`}</p>
              <p>{`剩余票数：${bango.remained_seats}`}</p>
              <p>{`票价：${bango.fare}`}</p>
              <div className="card-actions justify-end">
                <TicketBuy onClick={handleBuyCountChange} initCount={1} />
                <button
                  className="btn btn-outline btn-warning btn-sm"
                  onClick={() => {
                    for (let i = 0; i < buyCount; i++) {
                      console.log(`buy ${i}`);
                      buyBusBangoTicket(bango.id, user.user.id).then(
                        (ticket) => {
                          console.log(ticket);
                          if (ticket === null) return;
                          setBuyTicketIds((prev) => [...prev, ticket.id]);
                        },
                        (err) => {
                          console.log(err);
                        }
                      ); // TODO: use current user id
                    }
                    setRemainedSeats(bango.remained_seats - buyCount);
                    createModalPopFunc(`buy-seat-modal-${bango.id}`)();
                    createModalCloseFunc(`select-seat-modal-${bango.id}`)();
                  }}
                >
                  购买
                </button>
              </div>
            </div>
          </div>
        </div>
        <dialog id={`buy-seat-modal-${bango.id}`} className="modal">
          <div className="modal-box flex-col justify-center">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg text-primary flex justify-center">
              扫描二维码付款
            </h3>
            <div className="flex justify-center py-2">
              <img src={BuyCode} alt="buy code" />
            </div>
            <button
              className="btn btn-block btn-outline btn-error btn-sm"
              onClick={() => {
                createModalCloseFunc(`buy-seat-modal-${bango.id}`)();
                for (const id of buyTicketIds) {
                  changeTicketStatus(id, "N").then(
                    (ticket) => {
                      console.log(ticket);
                    },
                    (err) => {
                      console.log(err);
                    }
                  );
                }
              }}
            >
              我已付款
            </button>
          </div>
        </dialog>
      </div>
    </dialog>
  );
}

function TicketBuy({
  onClick,
  initCount,
}: {
  onClick: (action: "add" | "sub") => boolean;
  initCount: number;
}) {
  const [count, setCount] = useState(initCount);

  const handleAdd = () => {
    if (!onClick("add")) return;
    setCount(count + 1);
  };
  const handleSub = () => {
    if (!onClick("sub")) return;
    setCount(count - 1);
  };

  return (
    <div className="btn-group flex">
      <span className="mt-1">购买数量：</span>
      <div
        className="left-btn border border-neutral-500 rounded-l-md h-8 pt-1"
        onClick={handleSub}
      >
        <Icon path={mdiMenuLeftOutline} size={1} />
      </div>
      <div className="btn btn-sm btn-disable rounded-none h-8 w-10 text-center">
        {count}
      </div>
      <div
        className="right-btn border border-neutral-500 rounded-r-md h-8 pt-1"
        onClick={handleAdd}
      >
        <Icon path={mdiMenuRightOutline} size={1} />
      </div>
    </div>
  );
}

function createModalPopFunc(modalId: string) {
  return () => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal === null) return;
    modal.showModal();
  };
}

function createModalCloseFunc(modalId: string) {
  return () => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal === null) return;
    modal.close();
  };
}
