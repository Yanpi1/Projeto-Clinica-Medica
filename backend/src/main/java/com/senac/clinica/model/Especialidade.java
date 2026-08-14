package com.senac.clinica.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "especialidades")
@Getter
@Setter
@NoArgsConstructor
public class Especialidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nome;

    @JsonIgnore
    @OneToMany(mappedBy = "especialidade")
    private List<Medico> medicos;

    public Especialidade(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }
}
