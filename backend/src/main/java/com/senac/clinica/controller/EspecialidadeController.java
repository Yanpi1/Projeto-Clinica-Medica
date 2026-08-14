package com.senac.clinica.controller;

import com.senac.clinica.model.Especialidade;
import com.senac.clinica.repository.EspecialidadeRepository;
import com.senac.clinica.repository.MedicoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.CONFLICT;

import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadeController {

    private final EspecialidadeRepository repository;
    private final MedicoRepository medicoRepository;

    public EspecialidadeController(EspecialidadeRepository repository, MedicoRepository medicoRepository) {
        this.repository = repository;
        this.medicoRepository = medicoRepository;
    }

    @GetMapping
    public List<Especialidade> listar() {
        return repository.findAll();
    }

    @PostMapping
    public Especialidade criar(@RequestBody Especialidade especialidade) {
        return repository.save(especialidade);
    }

    // Remove uma especialidade.
    // OBS: a entidade Especialidade está mapeada com cascade = ALL + orphanRemoval sobre
    // "medicos", então excluir uma especialidade apaga em cascata todos os médicos dela.
    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        if (medicoRepository.existsByEspecialidadeId(id)) {
            throw new ResponseStatusException(CONFLICT, "Não é possível excluir uma especialidade com médicos vinculados");
        }
        repository.deleteById(id);
    }
}
