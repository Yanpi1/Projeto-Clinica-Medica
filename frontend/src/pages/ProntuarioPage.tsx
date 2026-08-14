import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Paciente, Prontuario } from '../types';

export default function ProntuarioPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => { api.listarPacientes().then(setPacientes); }, []);

  async function handleBuscar() {
    if (!pacienteId) return;
    setProntuario(await api.buscarProntuario(Number(pacienteId)));
  }

  function fmtData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  const termo = busca.trim().toLocaleLowerCase('pt-BR');
  const pacientesFiltrados = termo
    ? pacientes.filter(p => p.nome.toLocaleLowerCase('pt-BR').includes(termo) || p.cpf.includes(termo))
    : pacientes;

  return (
    <div className="page">
      <div className="page-head">
        <h1>Prontuário</h1>
        <p>Histórico consolidado de consultas e prescrições do paciente.</p>
      </div>

      <div className="card">
        <div className="inline-form">
          <input
            type="search"
            placeholder="Buscar por nome ou CPF"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <select value={pacienteId} onChange={e => setPacienteId(e.target.value)}>
            <option value="">Selecione um paciente</option>
            {pacientesFiltrados.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.cpf}</option>)}
          </select>
          <button className="btn-primary" onClick={handleBuscar}>Ver prontuário</button>
        </div>
      </div>

      {prontuario && (
        <>
          <div className="card">
            <h2>Consultas — {prontuario.pacienteNome}</h2>
            <table className="data-table">
              <thead><tr><th>Data</th><th>Médico</th><th>Status</th><th>Observações</th></tr></thead>
              <tbody>
                {prontuario.consultas.map(c => (
                  <tr key={c.id}>
                    <td>{fmtData(c.dataHora)}</td>
                    <td>{c.medico?.nome}</td>
                    <td><span className="tag tag-muted">{c.status}</span></td>
                    <td>{c.observacoes}</td>
                  </tr>
                ))}
                {prontuario.consultas.length === 0 && (
                  <tr><td colSpan={4} className="empty-state">Nenhuma consulta registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>Prescrições</h2>
            <table className="data-table">
              <thead><tr><th>Medicamento</th><th>Dosagem</th><th>Instruções</th></tr></thead>
              <tbody>
                {prontuario.prescricoes.map(p => (
                  <tr key={p.id}><td>{p.medicamento}</td><td>{p.dosagem}</td><td>{p.instrucoes}</td></tr>
                ))}
                {prontuario.prescricoes.length === 0 && (
                  <tr><td colSpan={3} className="empty-state">Nenhuma prescrição registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>Exames</h2>
            <table className="data-table">
              <thead><tr><th>Data</th><th>Tipo</th><th>Status</th><th>Resultado</th></tr></thead>
              <tbody>
                {prontuario.exames.map(e => (
                  <tr key={e.id}>
                    <td>{fmtData(e.dataSolicitacao)}</td><td>{e.tipo}</td>
                    <td><span className="tag tag-muted">{e.status}</span></td><td>{e.resultado || '—'}</td>
                  </tr>
                ))}
                {prontuario.exames.length === 0 && (
                  <tr><td colSpan={4} className="empty-state">Nenhum exame registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
