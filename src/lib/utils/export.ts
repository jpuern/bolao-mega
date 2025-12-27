export function exportToCSV(data: any[], filename: string) {
    if (data.length === 0) {
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function formatBolaoForExport(bolao: any) {
    return {
        'Número': bolao.numero,
        'Nome': bolao.nome,
        'Status': bolao.status,
        'Data Início': bolao.data_inicio,
        'Data Encerramento': bolao.data_encerramento,
        'Valor do Jogo': bolao.valor_cota || bolao.valor_jogo,
        'Taxa Organizador': bolao.taxa_organizador + '%',
    };
}

export function formatJogoForExport(jogo: any) {
    return {
        'Código': jogo.id.slice(-8).toUpperCase(),
        'Nome': jogo.nome,
        'WhatsApp': jogo.whatsapp,
        'Números': jogo.numeros.join(', '),
        'Valor': jogo.valor,
        'Status': jogo.status,
        'Data': new Date(jogo.created_at).toLocaleString('pt-BR'),
    };
}
