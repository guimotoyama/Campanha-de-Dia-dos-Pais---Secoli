document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Efeito de Scroll no Header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.cabecalho-fixo');
        const heroHeight = document.querySelector('.heroi').offsetHeight;
        
        // O fundo ativa apenas quando a rolagem atinge 90% da altura da Hero
        if (window.scrollY > heroHeight * 0.8) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Navegação Suave do Header (Efeito Premium)
    const linksNav = document.querySelectorAll('.navegacao-fixa a');
    
    linksNav.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 150);
            }
        });
    });

    // 1. Animações da Hero

    const tlHero = gsap.timeline();
    tlHero.to('.titulo-heroi', {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        startAt: { y: 30 }
    })
    .to('.subtitulo-heroi', {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        startAt: { y: 30 }
    }, '-=0.7')
    .to('.botao-chamada', {
        duration: 1,
        opacity: 1,
        scale: 1,
        ease: 'back.out(1.7)',
        startAt: { scale: 0.9 }
    }, '-=0.5');

    // Efeito de clique suave em todos os botões de chamada
    const botoesChamada = document.querySelectorAll('.botao-chamada');
    botoesChamada.forEach(btn => {
        btn.addEventListener('mousedown', () => gsap.to(btn, { scale: 0.95, duration: 0.1 }));
        btn.addEventListener('mouseup', () => gsap.to(btn, { scale: 1.05, duration: 0.3 }));
        btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1.05, duration: 0.3 }));
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Dispara evento de Intenção (Início de Conversão) para o Meta Pixel
            if (typeof fbq === 'function') {
                fbq('track', 'InitiateCheckout');
                console.log('Evento Meta Pixel: InitiateCheckout disparado!');
            }

            setTimeout(() => {
                document.querySelector('#formulario').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        });
    });

    // 2. Animações da Seção Porque
    gsap.from('.caixa-imagem-porque', {
        scrollTrigger: {
            trigger: '.porque',
            start: 'top 80%',
        },
        duration: 1.2,
        x: -100,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.caixa-texto-porque', {
        scrollTrigger: {
            trigger: '.porque',
            start: 'top 80%',
        },
        duration: 1.2,
        x: 100,
        opacity: 0,
        ease: 'power3.out'
    });

    // 3. LÓGICA DO CARROSSEL (Foco Central)
    const trilho = document.querySelector('.trilho-carrossel');
    const cartoes = document.querySelectorAll('.cartao-produto');
    let indiceAtivo = 0; // Começa com o primeiro cartão no centro
    let viewContentTimer = null; // Timer para evitar disparos falsos no carrossel

    function atualizarCarrossel() {
        cartoes.forEach((cartao, indice) => {
            cartao.classList.remove('active');
            if (indice === indiceAtivo) {
                cartao.classList.add('active');
            }
        });

        // Limpa timer anterior se o usuário mudar de card rapidamente
        if (viewContentTimer) {
            clearTimeout(viewContentTimer);
            viewContentTimer = null;
        }

        // Agenda o disparo do evento apenas se o card ficar em foco por 2 segundos
        viewContentTimer = setTimeout(() => {
            if (typeof fbq === 'function') {
                fbq('track', 'ViewContent', {
                    content_name: cartoes[indiceAtivo].querySelector('h3')?.innerText || 'Produto Carrossel',
                    content_category: 'Curadoria de Excelência'
                });
                console.log('Evento Meta Pixel: ViewContent disparado após 2s de foco em ' + (cartoes[indiceAtivo].querySelector('h3')?.innerText || 'Produto'));
            }
        }, 2000);

        const larguraCartao = cartoes[0].offsetWidth;
        const estiloTrilho = window.getComputedStyle(trilho);
        const espacamento = parseInt(estiloTrilho.gap) || 60; 
        
        const totalTrilhoWidth = (cartoes.length * larguraCartao) + ((cartoes.length - 1) * espacamento);
        const centroCard = (indiceAtivo * (larguraCartao + espacamento)) + (larguraCartao / 2);
        
        // O trilho já está centralizado pelo CSS (justify-content: center).
        // Calculamos o deslocamento necessário para que o centro do card ativo 
        // coincida com o centro do trilho (que é o centro da tela).
        const deslocamento = (totalTrilhoWidth / 2) - centroCard;
        
        gsap.to(trilho, {
            x: deslocamento,
            duration: 0.6,
            ease: 'cubic-bezier(0.23, 1, 0.32, 1)'
        });
    }

    document.getElementById('anterior').addEventListener('click', () => {
        indiceAtivo = (indiceAtivo === 0) ? cartoes.length - 1 : indiceAtivo - 1;
        atualizarCarrossel();
    });

    document.getElementById('proximo').addEventListener('click', () => {
        indiceAtivo = (indiceAtivo === cartoes.length - 1) ? 0 : indiceAtivo + 1;
        atualizarCarrossel();
    });

    // Posição inicial e manipulador de redimensionamento da janela
    window.addEventListener('resize', atualizarCarrossel);
    atualizarCarrossel();

    // 4. Animação do Formulário
    gsap.from('.container-formulario', {
        scrollTrigger: {
            trigger: '.secao-formulario',
            start: 'top 80%',
        },
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    });

    // 5. Animação da Seção de Apelos (Scroll-Linked Animation / Scrub)
    gsap.fromTo('.card-apelo', 
        {
            opacity: 0,
            y: 60
        },
        {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            ease: 'power1.in',
            scrollTrigger: {
                trigger: '.secao-apelos',
                start: 'top 70%',
                end: 'top 0%',
                scrub: 1,
                toggleActions: 'play none none none'
            }
        }
    );

    // 6. EVENTOS DE CONVERSÃO E ENVIO (META PIXEL & NETLIFY)
    const formularioLead = document.getElementById('formulario-lead');
    if (formularioLead) {
        formularioLead.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // Dispara evento de Lead para o Meta Pixel
            if (typeof fbq === 'function') {
                fbq('track', 'Lead');
                console.log('Evento Meta Pixel: Lead disparado!');
            }

            const btn = formularioLead.querySelector('.botao-enviar');
            const originalText = btn.innerText;
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            const formData = new FormData(formularioLead);

            try {
                const response = await fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData).toString(),
                });

                if (response.ok) {
                    btn.innerText = 'Solicitação Enviada!';
                    btn.style.backgroundColor = '#28a745';
                    formularioLead.reset();
                } else {
                    throw new Error('Erro no servidor');
                }
            } catch (error) {
                console.error('Erro ao enviar formulário:', error);
                btn.innerText = 'Erro ao enviar. Tente novamente.';
                btn.style.backgroundColor = '#dc3545';
            } finally {
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.backgroundColor = '';
                }, 3000);
            }
        });
    }

    // Evento de clique no WhatsApp (Intenção de Contato)
    const linkWhatsapp = document.querySelector('.icon-whatsapp')?.parentElement;
    if (linkWhatsapp) {
        linkWhatsapp.addEventListener('click', () => {
            if (typeof fbq === 'function') {
                fbq('track', 'Contact');
                console.log('Evento Meta Pixel: Contact disparado!');
            }
        });
    }

    // 7. MÁSCARA DE WHATSAPP (UX Premium)
    const whatsappInput = document.getElementById('whatsapp-input');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\\D/g, ''); // Remove tudo que não é dígito
            let formattedValue = '';

            if (value.length > 0) {
                formattedValue = '(' + value.substring(0, 2);
                if (value.length > 2) {
                    formattedValue += ') ' + value.substring(2, 7);
                }
                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 11);
                }
            }
            e.target.value = formattedValue;
        });
    }

    // Modal do Catálogo
    const btnCatalogo = document.getElementById('btn-catalogo');
    const modalCatalogo = document.getElementById('modal-catalogo');
    const closeModal = document.querySelector('.close-modal');
    const iframeCatalogo = document.getElementById('iframe-catalogo');
    
    const urlCatalogo = "Catálogo - Dia dos Pais 2026_compressed.pdf";
    let catalogViewTimer = null; // Timer para rastrear tempo de visualização

    if (btnCatalogo) {
        btnCatalogo.addEventListener('click', (e) => {
            e.preventDefault();
            iframeCatalogo.src = urlCatalogo;
            modalCatalogo.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Inicia timer de 5 segundos para o Meta Pixel
            catalogViewTimer = setTimeout(() => {
                if (typeof fbq === 'function') {
                    fbq('trackCustom', 'ViewedCatalog5s');
                    console.log('Evento Meta Pixel: ViewedCatalog5s disparado (usuário viu por 5s)!');
                }
            }, 5000);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modalCatalogo.classList.remove('active');
            document.body.style.overflow = '';
            iframeCatalogo.src = '';
            
            // Cancela o timer se o usuário fechar antes dos 5 segundos
            if (catalogViewTimer) {
                clearTimeout(catalogViewTimer);
                catalogViewTimer = null;
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalCatalogo) {
            modalCatalogo.classList.remove('active');
            document.body.style.overflow = '';
            iframeCatalogo.src = '';

            // Cancela o timer se o usuário fechar antes dos 5 segundos
            if (catalogViewTimer) {
                clearTimeout(catalogViewTimer);
                catalogViewTimer = null;
            }
        }
    });
});