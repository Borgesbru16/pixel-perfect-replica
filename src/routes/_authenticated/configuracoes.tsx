import { queryOptions, useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessao } from "@/hooks/use-sessao";
import { atualizarParametro, listarParametros, type Parametro } from "@/lib/configuracoes.functions";
import { PAPEIS, ROTULO_PAPEL, DESCRICAO_PAPEL, type Papel } from "@/lib/papeis";
import { definirAtivo, definirPapel, listarUsuarios } from "@/lib/usuarios.functions";

const parametrosQuery = queryOptions({ queryKey: ["parametros"], queryFn: () => listarParametros() });
const usuariosQuery = queryOptions({ queryKey: ["usuarios"], queryFn: () => listarUsuarios() });

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Usuários e configurações — Simulador de Preços" },
      { name: "description", content: "Perfis de acesso e parâmetros comerciais pendentes de validação." },
      { property: "og:title", content: "Usuários e configurações — Simulador de Preços" },
      { property: "og:description", content: "Perfis de acesso e parâmetros comerciais pendentes de validação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(parametrosQuery),
  component: PaginaConfiguracoes,
});

function rotuloValor(v: unknown) {
  if (v === true) return "Sim";
  if (v === false) return "Não";
  return String(v);
}

function PaginaConfiguracoes() {
  const { eAdmin } = useSessao();
  return (
    <>
      <PageHeader
        modulo="Administração"
        titulo="Usuários e configurações"
        descricao="Parâmetros comerciais ainda não definidos e perfis de acesso dos usuários."
      />
      <Tabs defaultValue="parametros" className="mt-6">
        <TabsList>
          <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="parametros" className="mt-4">
          <Parametros podeEditar={eAdmin} />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-4">
          {eAdmin ? (
            <Usuarios />
          ) : (
            <div className="panel p-6 text-sm text-muted-foreground">Apenas o administrador gerencia usuários.</div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function Parametros({ podeEditar }: { podeEditar: boolean }) {
  const { data } = useSuspenseQuery(parametrosQuery);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (p: { chave: string; valor: string | boolean; status: Parametro["status"] }) =>
      atualizarParametro({ data: p }),
    onSuccess: () => {
      toast.success("Parâmetro atualizado.");
      qc.invalidateQueries({ queryKey: ["parametros"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });

  return (
    <div className="panel overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parâmetro</TableHead>
            <TableHead className="w-56">Valor</TableHead>
            <TableHead className="w-44">Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.chave}>
              <TableCell>
                <p className="font-medium text-foreground">{p.descricao}</p>
                <p className="tabular text-xs text-muted-foreground">{p.chave}</p>
              </TableCell>
              <TableCell>
                {podeEditar && p.opcoes.length > 0 ? (
                  <Select
                    value={JSON.stringify(p.valor)}
                    onValueChange={(v) => mut.mutate({ chave: p.chave, valor: JSON.parse(v), status: p.status })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {p.opcoes.map((o) => (
                        <SelectItem key={JSON.stringify(o)} value={JSON.stringify(o)}>
                          {rotuloValor(o)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="tabular">{rotuloValor(p.valor)}</span>
                )}
              </TableCell>
              <TableCell>
                {podeEditar ? (
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={p.status === "validado"}
                      onCheckedChange={(c) =>
                        mut.mutate({
                          chave: p.chave,
                          valor: p.valor as string | boolean,
                          status: c ? "validado" : "pendente_validacao",
                        })
                      }
                    />
                    {p.status === "validado" ? "Validado" : "Pendente"}
                  </label>
                ) : (
                  <Badge variant={p.status === "validado" ? "success" : "warning"}>
                    {p.status === "validado" ? "Validado" : "Pendente"}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Usuarios() {
  const { data, isLoading, error } = useQuery(usuariosQuery);
  const { sessao } = useSessao();
  const qc = useQueryClient();
  const aoErro = (e: unknown) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
  const aoSucesso = () => {
    toast.success("Usuário atualizado.");
    qc.invalidateQueries({ queryKey: ["usuarios"] });
  };
  const papel = useMutation({
    mutationFn: (d: { usuarioId: string; papel: Papel }) => definirPapel({ data: d }),
    onSuccess: aoSucesso,
    onError: aoErro,
  });
  const ativo = useMutation({
    mutationFn: (d: { usuarioId: string; ativo: boolean }) => definirAtivo({ data: d }),
    onSuccess: aoSucesso,
    onError: aoErro,
  });

  if (isLoading) return <div className="panel p-6 text-sm text-muted-foreground">Carregando usuários…</div>;
  if (error) return <div className="panel p-6 text-sm text-destructive">{error.message}</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="w-52">Perfil</TableHead>
              <TableHead className="w-28">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((u) => {
              const proprio = u.id === sessao?.userId;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{u.nome ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.papeis[0] ?? ""}
                      disabled={proprio}
                      onValueChange={(v) => papel.mutate({ usuarioId: u.id, papel: v as Papel })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAPEIS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {ROTULO_PAPEL[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={u.ativo}
                      disabled={proprio}
                      onCheckedChange={(c) => ativo.mutate({ usuarioId: u.id, ativo: c })}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <aside className="panel p-5">
        <p className="eyebrow">Perfis</p>
        <ul className="mt-4 space-y-4">
          {PAPEIS.map((p) => (
            <li key={p}>
              <p className="text-sm font-medium text-foreground">{ROTULO_PAPEL[p]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{DESCRICAO_PAPEL[p]}</p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
