import { useState, useEffect, useMemo } from "react";

import { chunk } from "lodash";

import { mdiArrowLeftRightBold } from "@mdi/js";
import Icon from "@mdi/react";

import { getTickets } from "../api";
import type { Ticket } from "../api";

export function Trip() {
  // 当前页数
  const [curPage, setCurPage] = useState(1);
  // 总的票
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // 每页列数
  const [columnCount, setColumnCount] = useState(3);
  // 每页行数
  const [rowCount, setrowCount] = useState(3);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const _tickets = await getTickets();
      if (isCancelled) return;
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
          <Icon className="flex-1" path={mdiArrowLeftRightBold} size={1} />
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
  return (
    <div className="card w-96 bg-neutral text-neutral-content shadow-xl m-1">
      <div className="card-body">
        <h2 className="card-title">{ticket.userId}</h2>
        <p>{ticket.title}</p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-outline btn-primary btn-sm"
            onClick={createSelectSeatModalPopfunc(ticket.id.toString())}
          >
            选座
          </button>
        </div>
        <SelectSeatModal ticketId={ticket.id.toString()} />
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

function SelectSeatModal({ ticketId }: { ticketId: string }) {
  return (
    <dialog id={`select-seat-modal-${ticketId}`} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Hello {ticketId}!</h3>
        <p className="py-4">Press ESC key or click on ✕ button to close</p>
      </div>
    </dialog>
  );
}

function createSelectSeatModalPopfunc(ticketId: string) {
  return () => {
    const modal = document.getElementById(
      `select-seat-modal-${ticketId}`
    ) as HTMLDialogElement | null;
    if (modal === null) return;
    modal.showModal();
  };
}
