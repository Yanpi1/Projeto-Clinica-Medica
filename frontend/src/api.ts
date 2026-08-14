import type {
  Especialidade, Medico, ConvenioSaude, Paciente, Sala,
  Consulta, Prescricao, Exame, Pagamento, Prontuario, DashboardResumo,
} from './types';

const BASE = 'http://localhost:8086/api';

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const payload = await res.json().catch(() => null) as { detail?: string; message?: string } | null;
    throw new Error(payload?.detail || payload?.message || `Erro HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  return parse<T>(res);
}
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parse<T>(res);
}
async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parse<T>(res);
}

export const api = {
  dashboard: () => get<DashboardResumo>('/dashboard/resumo'),

  listarEspecialidades: () => get<Especialidade[]>('/especialidades'),
  criarEspecialidade: (nome: string) => post<Especialidade>('/especialidades', { nome }),
  excluirEspecialidade: (id: number) =>
    fetch(`${BASE}/especialidades/${id}`, { method: 'DELETE' }).then(async r => {
      if (!r.ok) {
        const payload = await r.json().catch(() => null) as { detail?: string; message?: string } | null;
        throw new Error(payload?.detail || payload?.message || `Erro HTTP ${r.status}`);
      }
      return true;
    }),

  listarMedicos: () => get<Medico[]>('/medicos'),
  criarMedico: (m: { nome: string; crm: string; especialidadeId: number }) => post<Medico>('/medicos', m),

  listarConvenios: () => get<ConvenioSaude[]>('/convenios'),
  criarConvenio: (c: { nome: string; percentualCobertura: number }) => post<ConvenioSaude>('/convenios', c),

  listarPacientes: () => get<Paciente[]>('/pacientes'),
  criarPaciente: (p: { nome: string; cpf: string; dataNascimento: string; telefone: string; convenioId: number | null }) =>
    post<Paciente>('/pacientes', p),

  listarSalas: () => get<Sala[]>('/salas'),
  criarSala: (s: { numero: string; andar: number }) => post<Sala>('/salas', s),

  listarConsultas: () => get<Consulta[]>('/consultas'),
  criarConsulta: (c: { pacienteId: number; medicoId: number; salaId: number; dataHora: string; valor: number; observacoes: string }) =>
    post<Consulta>('/consultas', c),
  atualizarStatusConsulta: (id: number, status: string) => patch<Consulta>(`/consultas/${id}/status`, { status }),

  listarPrescricoes: (consultaId?: number) =>
    get<Prescricao[]>(consultaId ? `/prescricoes?consultaId=${consultaId}` : '/prescricoes'),
  criarPrescricao: (p: { consultaId: number; medicamento: string; dosagem: string; instrucoes: string }) =>
    post<Prescricao>('/prescricoes', p),

  listarExames: (consultaId?: number) =>
    get<Exame[]>(consultaId ? `/exames?consultaId=${consultaId}` : '/exames'),
  criarExame: (e: { consultaId: number; tipo: string; dataSolicitacao: string }) => post<Exame>('/exames', e),
  registrarResultadoExame: (id: number, resultado: string) => patch<Exame>(`/exames/${id}/resultado`, { resultado }),

  listarPagamentos: () => get<Pagamento[]>('/pagamentos'),
  criarPagamento: (p: { consultaId: number; valorCobrado: number; formaPagamento: string }) =>
    post<Pagamento>('/pagamentos', p),
  confirmarPagamento: (id: number) => patch<Pagamento>(`/pagamentos/${id}/confirmar`, {}),

  buscarProntuario: (pacienteId: number) => get<Prontuario>(`/prontuario/${pacienteId}`),
};
