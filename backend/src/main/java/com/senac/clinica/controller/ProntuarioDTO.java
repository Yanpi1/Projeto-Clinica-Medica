package com.senac.clinica.controller;

import com.senac.clinica.model.Consulta;
import com.senac.clinica.model.Prescricao;
import com.senac.clinica.model.Exame;

import java.util.List;

public class ProntuarioDTO {
    public String pacienteNome;
    public List<Consulta> consultas;
    public List<Prescricao> prescricoes;
    public List<Exame> exames;
}
