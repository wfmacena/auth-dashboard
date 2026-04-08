import { useEffect, useState } from "react";
import api from "./api/axios";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("admin_token") === "admin-logado"
  );

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    salesByProduct: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [productId, setProductId] = useState("");
  const [role, setRole] = useState("Member");
  const [timeOption, setTimeOption] = useState("1 semana");
  const [registerSale, setRegisterSale] = useState(true);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [requiredVersion, setRequiredVersion] = useState("1.0.0");
  const [isActive, setIsActive] = useState(true);

  async function handleAdminLogin(e) {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await api.post("/Admin/login", {
        username: adminUsername,
        password: adminPassword,
      });

      if (response.data.success) {
        localStorage.setItem("admin_token", response.data.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setLoginError(error?.response?.data?.error || "Erro ao fazer login");
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  }

  async function loadUsers() {
    try {
      const response = await api.get("/Users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  async function loadProducts() {
    try {
      const response = await api.get("/Products");
      setProducts(response.data);

      if (response.data.length > 0 && !productId) {
        setProductId(response.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }

  async function loadSales() {
    try {
      const response = await api.get("/Sales");
      setSales(response.data);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    }
  }

  async function loadSalesStats() {
    try {
      const response = await api.get("/Sales/stats");
      setSalesStats(response.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }

  async function reloadAll() {
    await Promise.all([
      loadUsers(),
      loadProducts(),
      loadSales(),
      loadSalesStats(),
    ]);
  }

  useEffect(() => {
    if (isAuthenticated) {
      reloadAll();
    }
  }, [isAuthenticated]);

  function resetForm() {
    setLogin("");
    setPassword("");
    setRole("Member");
    setTimeOption("1 semana");
    setRegisterSale(true);
    setIsEditing(false);
    setEditingUserId(null);

    if (products.length > 0) {
      setProductId(products[0].id);
    } else {
      setProductId("");
    }
  }

  function resetProductForm() {
    setProductName("");
    setProductPrice("");
    setRequiredVersion("1.0.0");
    setIsActive(true);
  }

  async function handleCreateUser() {
    try {
      await api.post("/Users", {
        login,
        password,
        productId: Number(productId),
        role,
        timeOption,
        customDate: null,
        registerSale,
      });

      await reloadAll();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      alert(error?.response?.data?.error || "Erro ao criar usuário");
    }
  }

  async function handleUpdateUser() {
    try {
      await api.put(`/Users/${editingUserId}`, {
        login,
        password,
        productId: Number(productId),
        role,
        timeOption,
        customDate: null,
      });

      await reloadAll();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          `Erro ao editar usuário (${error?.response?.status || "sem status"})`
      );
    }
  }

  function handleOpenEditModal(user) {
    setIsEditing(true);
    setEditingUserId(user.id);
    setLogin(user.login);
    setPassword("");
    setRole(user.role);

    const selectedProduct = products.find((p) => p.name === user.product);
    setProductId(selectedProduct ? selectedProduct.id : "");

    setTimeOption("1 semana");
    setRegisterSale(false);
    setShowModal(true);
  }

  async function handleResetHwid(userId) {
    try {
      await api.post(`/Users/${userId}/reset-hwid`);
      await loadUsers();
    } catch (error) {
      console.error("Erro ao resetar HWID:", error);
      alert(error?.response?.data?.error || "Erro ao resetar HWID");
    }
  }

  async function handleDeleteUser(userId) {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este usuário?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/Users/${userId}`);
      await reloadAll();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert(error?.response?.data?.error || "Erro ao excluir usuário");
    }
  }

  async function handleCreateProduct() {
    try {
      await api.post("/Products", {
        name: productName,
        price: Number(productPrice),
        requiredVersion,
        isActive,
      });

      await reloadAll();
      resetProductForm();
      setShowProductModal(false);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert(error?.response?.data?.error || "Erro ao criar produto");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl"
        >
          <h1 className="mb-6 text-3xl font-bold">Login do Painel</h1>

          <input
            value={adminUsername}
            onChange={(e) => setAdminUsername(e.target.value)}
            placeholder="Usuário"
            className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
          />

          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Senha"
            className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
          />

          {loginError && (
            <p className="mb-4 text-sm text-red-400">{loginError}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-white py-3 font-medium text-black"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-10 py-6">
        <h1 className="text-3xl font-bold">Painel de autenticação</h1>
        <button
          onClick={handleLogout}
          className="rounded-md border border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200"
        >
          Sair
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-md px-4 py-2 text-sm font-medium border ${
              activeTab === "users"
                ? "border-zinc-800 bg-zinc-900 text-white"
                : "border-transparent text-zinc-400"
            }`}
          >
            Usuários
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`rounded-md px-4 py-2 text-sm font-medium border ${
              activeTab === "products"
                ? "border-zinc-800 bg-zinc-900 text-white"
                : "border-transparent text-zinc-400"
            }`}
          >
            Produtos
          </button>

          <button
            onClick={() => setActiveTab("money")}
            className={`rounded-md px-4 py-2 text-sm font-medium border ${
              activeTab === "money"
                ? "border-zinc-800 bg-zinc-900 text-white"
                : "border-transparent text-zinc-400"
            }`}
          >
            Dinheiro
          </button>
        </div>

        {activeTab === "users" && (
          <div className="rounded-2xl border border-zinc-800 bg-black">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <h2 className="text-3xl font-bold">Gerenciar Usuários</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
              >
                + Adicionar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-400">
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-4">LOGIN</th>
                    <th className="px-6 py-4">PRODUTO</th>
                    <th className="px-6 py-4">ROLE</th>
                    <th className="px-6 py-4">EXPIRA</th>
                    <th className="px-6 py-4">LOGINS</th>
                    <th className="px-6 py-4">IP</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4">HWID</th>
                    <th className="px-6 py-4">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-900">
                      <td className="px-6 py-6 font-semibold">{user.login}</td>
                      <td className="px-6 py-6">{user.product}</td>
                      <td className="px-6 py-6">
                        <span className="rounded-md border border-blue-900 bg-blue-950 px-3 py-1 text-xs text-blue-200">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-emerald-400">
                        {user.expiresAt
                          ? new Date(user.expiresAt).toLocaleDateString("pt-BR")
                          : "Lifetime"}
                      </td>
                      <td className="px-6 py-6">{user.loginCount}</td>
                      <td className="px-6 py-6">{user.lastIp || "-"}</td>
                      <td className="px-6 py-6">
                        <span className={user.isOnline ? "text-emerald-400" : "text-zinc-400"}>
                          {user.isOnline ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-6 py-6">{user.hwid}</td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="rounded-md border border-zinc-700 px-3 py-1 text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleResetHwid(user.id)}
                            className="rounded-md border border-zinc-700 px-3 py-1 text-xs"
                          >
                            HWID
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="rounded-md border border-red-900 bg-red-950 px-3 py-1 text-xs text-red-200"
                          >
                            X
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-6 py-10 text-center text-zinc-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="rounded-2xl border border-zinc-800 bg-black">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <h2 className="text-3xl font-bold">Gerenciar Produtos</h2>
              <button
                onClick={() => {
                  resetProductForm();
                  setShowProductModal(true);
                }}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
              >
                + Adicionar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-zinc-400">
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">NOME</th>
                    <th className="px-6 py-4">PREÇO</th>
                    <th className="px-6 py-4">VERSÃO</th>
                    <th className="px-6 py-4">ATIVO</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-zinc-900">
                      <td className="px-6 py-6">{product.id}</td>
                      <td className="px-6 py-6 font-semibold">{product.name}</td>
                      <td className="px-6 py-6">R$ {Number(product.price).toFixed(2)}</td>
                      <td className="px-6 py-6">{product.requiredVersion}</td>
                      <td className="px-6 py-6">
                        <span className={product.isActive ? "text-emerald-400" : "text-red-400"}>
                          {product.isActive ? "Sim" : "Não"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-zinc-500">
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "money" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-black p-6">
                <p className="text-sm text-zinc-400">Total de vendas</p>
                <h2 className="mt-2 text-3xl font-bold">{salesStats.totalSales}</h2>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-6">
                <p className="text-sm text-zinc-400">Total faturado</p>
                <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                  R$ {Number(salesStats.totalRevenue).toFixed(2)}
                </h2>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-6">
              <h2 className="mb-4 text-2xl font-bold">Vendas por produto</h2>
              <div className="space-y-3">
                {salesStats.salesByProduct?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3"
                  >
                    <span>{item.product}</span>
                    <span className="text-zinc-400">
                      {item.count} venda(s) — R$ {Number(item.total).toFixed(2)}
                    </span>
                  </div>
                ))}

                {(!salesStats.salesByProduct || salesStats.salesByProduct.length === 0) && (
                  <p className="text-zinc-500">Nenhuma venda encontrada.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black">
              <div className="border-b border-zinc-800 px-6 py-5">
                <h2 className="text-2xl font-bold">Histórico de vendas</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-400">
                    <tr className="border-b border-zinc-800">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">USUÁRIO</th>
                      <th className="px-6 py-4">PRODUTO</th>
                      <th className="px-6 py-4">VALOR</th>
                      <th className="px-6 py-4">DATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-zinc-900">
                        <td className="px-6 py-6">{sale.id}</td>
                        <td className="px-6 py-6 font-semibold">{sale.user}</td>
                        <td className="px-6 py-6">{sale.product}</td>
                        <td className="px-6 py-6 text-emerald-400">
                          R$ {Number(sale.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-6">
                          {new Date(sale.createdAt).toLocaleDateString("pt-BR")}{" "}
                          {new Date(sale.createdAt).toLocaleTimeString("pt-BR")}
                        </td>
                      </tr>
                    ))}

                    {sales.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-zinc-500">
                          Nenhuma venda encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-[420px] rounded-2xl border border-zinc-800 bg-black p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">
              {isEditing ? "Editar Usuário" : "Adicionar Usuário"}
            </h2>

            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Login"
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? "Nova senha (opcional)" : "Senha (opcional)"}
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            />

            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            >
              <option>Member</option>
              <option>Owner</option>
              <option>Developer</option>
              <option>Friends</option>
            </select>

            <select
              value={timeOption}
              onChange={(e) => setTimeOption(e.target.value)}
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            >
              <option>1 semana</option>
              <option>30 dias</option>
              <option>90 dias</option>
              <option>1 ano</option>
              <option>Lifetime</option>
            </select>

            {!isEditing && (
              <div className="mb-6 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={registerSale}
                  onChange={(e) => setRegisterSale(e.target.checked)}
                />
                <span>Registrar venda</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={isEditing ? handleUpdateUser : handleCreateUser}
                className="flex-1 rounded-md bg-white py-2 text-black"
              >
                {isEditing ? "Salvar" : "Adicionar"}
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="flex-1 rounded-md bg-red-900 py-2 text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-[420px] rounded-2xl border border-zinc-800 bg-black p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">Adicionar Produto</h2>

            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Nome do produto"
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            />

            <input
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="Preço"
              type="number"
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            />

            <input
              value={requiredVersion}
              onChange={(e) => setRequiredVersion(e.target.value)}
              placeholder="Versão requerida"
              className="mb-4 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
            />

            <div className="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Produto ativo</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateProduct}
                className="flex-1 rounded-md bg-white py-2 text-black"
              >
                Adicionar
              </button>

              <button
                onClick={() => {
                  resetProductForm();
                  setShowProductModal(false);
                }}
                className="flex-1 rounded-md bg-red-900 py-2 text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;