package com.senac.clinica.controller;

import com.senac.clinica.model.*;
import com.senac.clinica.repository.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;

import java.util.List;

@RestController
@RequestMapping("/api/consultas")
public class ConsultaController {

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final SalaRepository salaRepository;

    public ConsultaController(ConsultaRepository consultaRepository, PacienteRepository pacienteRepository,
                               MedicoRepository medicoRepository, SalaRepository salaRepository) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.salaRepository = salaRepository;
    }

    @GetMapping
    public List<Consulta> listar() {
        return consultaRepository.findAll();
    }

    // Agenda uma nova consulta, impedindo conflito de médico ou sala no mesmo horário.
    @PostMapping
    public Consulta criar(@RequestBody ConsultaRequest req) {
        if (req.dataHora == null || req.valor == null || req.valor < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Data/hora e valor válido são obrigatórios");
        }
        if (consultaRepository.existsByMedicoIdAndDataHoraAndStatusNot(req.medicoId, req.dataHora, "CANCELADA")) {
            throw new ResponseStatusException(CONFLICT, "O médico já possui uma consulta nesse horário");
        }
        if (consultaRepository.existsBySalaIdAndDataHoraAndStatusNot(req.salaId, req.dataHora, "CANCELADA")) {
            throw new ResponseStatusException(CONFLICT, "A sala já possui uma consulta nesse horário");
        }
        Paciente paciente = pacienteRepository.findById(req.pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));
        Medico medico = medicoRepository.findById(req.medicoId)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado"));
        Sala sala = salaRepository.findById(req.salaId)
                .orElseThrow(() -> new RuntimeException("Sala não encontrada"));

        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setMedico(medico);
        consulta.setSala(sala);
        consulta.setDataHora(req.dataHora);
        consulta.setValor(req.valor);
        consulta.setObservacoes(req.observacoes);
        consulta.setStatus("AGENDADA");

        return consultaRepository.save(consulta);
    }

    @PatchMapping("/{id}/status")
    public Consulta atualizarStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        String status = req.status == null ? "" : req.status.trim().toUpperCase();
        if (!List.of("AGENDADA", "REALIZADA", "CANCELADA").contains(status)) {
            throw new ResponseStatusException(BAD_REQUEST, "Status de consulta inválido");
        }
        consulta.setStatus(status);
        return consultaRepository.save(consulta);
    }

    public static class StatusRequest {
        public String status;
    }
}
