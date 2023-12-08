import { useRouteError, useNavigate } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const navigate = useNavigate();

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">喂喂！</h1>
          <p className="py-6">这是一个未知区域</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            好吧
          </button>
        </div>
      </div>
    </div>
  );
}
