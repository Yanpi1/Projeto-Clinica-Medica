package com.senac.clinica.controller;

import com.senac.clinica.model.Consulta;
import com.senac.clinica.model.Prescricao;
import com.senac.clinica.repository.ConsultaRepository;
import com.senac.clinica.repository.PrescricaoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

import java.util.List;

@RestController
@RequestMapping("/api/prescricoes")
public class PrescricaoController {

    private final PrescricaoRepository prescricaoRepository;
    private final ConsultaRepository consultaRepository;

    public PrescricaoController(PrescricaoRepository prescricaoRepository, ConsultaRepository consultaRepository) {
        this.prescricaoRepository = prescricaoRepository;
        this.consultaRepository = consultaRepository;
    }

    @GetMapping
    public List<Prescricao> listar(@RequestParam(required = false) Long consultaId) {
        if (consultaId != null) {
            return prescricaoRepository.findAllByConsultaId(consultaId);
        }
        return prescricaoRepository.findAll();
    }

    // Registra uma prescrição com dosagem obrigatória.
    @PostMapping
    public Prescricao criar(@RequestBody PrescricaoRequest req) {
        if (req.dosagem == null || req.dosagem.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "A dosagem é obrigatória");
        }
        Consulta consulta = consultaRepository.findById(req.consultaId)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        Prescricao prescricao = new Prescricao();
        prescricao.setConsulta(consulta);
        prescricao.setMedicamento(req.medicamento);
        prescricao.setDosagem(req.dosagem.trim());
        prescricao.setInstrucoes(req.instrucoes);

        return prescricaoRepository.save(prescricao);
    }
}
