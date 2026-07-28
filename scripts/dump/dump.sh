#!/bin/bash
# dump/dump.sh

set -e

# ============================================
# ФУНКЦИИ ДЛЯ ЛОГГИРОВАНИЯ
# ============================================
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1"
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1" >&2
}

log_warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1"
}

# ============================================
# ПРОВЕРКА ПЕРЕМЕННЫХ
# ============================================
log_info "==================================="
log_info "ЗАПУСК ДАМПА MONGODB"
log_info "==================================="

# Проверяем обязательные переменные
if [ -z "$SOURCE_HOST" ] || [ -z "$SOURCE_PORT" ] || [ -z "$SOURCE_DB" ]; then
    log_error "Не указаны параметры источника (SOURCE_HOST, SOURCE_PORT, SOURCE_DB)"
    exit 1
fi

if [ -z "$DESTINATION_HOST" ] || [ -z "$DESTINATION_PORT" ] || [ -z "$DESTINATION_DB" ]; then
    log_error "Не указаны параметры получателя (DESTINATION_HOST, DESTINATION_PORT, DESTINATION_DB)"
    exit 1
fi

log_success "Все переменные установлены"

# ============================================
# ФОРМИРУЕМ СТРОКИ ПОДКЛЮЧЕНИЯ
# ============================================
# Для источника
SOURCE_URI="mongodb://${SOURCE_USER}:${SOURCE_PASS}@${SOURCE_HOST}:${SOURCE_PORT}/${SOURCE_DB}?authSource=admin"

# Для получателя
DESTINATION_URI="mongodb://${DESTINATION_USER}:${DESTINATION_PASS}@${DESTINATION_HOST}:${DESTINATION_PORT}/${DESTINATION_DB}?authSource=admin"

if [ "$VERBOSE" = "true" ]; then
    log_info "SOURCE_URI: ${SOURCE_URI}"
    log_info "DESTINATION_URI: ${DESTINATION_URI}"
fi

# ============================================
# 1. ДАМП ИЗ ИСТОЧНИКА
# ============================================
if [ "$DUMP_DUMP_FROM_SOURCE" = "true" ]; then
    log_info "📤 Создание дампа из источника: ${SOURCE_HOST}:${SOURCE_PORT}/${SOURCE_DB}"

    # Создаём временную папку для дампа
    DUMP_DIR="/tmp/mongodb-dump-$(date +%s)"
    mkdir -p "$DUMP_DIR"

    # Выполняем дамп
    if mongodump \
        --host="$SOURCE_HOST" \
        --port="$SOURCE_PORT" \
        --username="$SOURCE_USER" \
        --password="$SOURCE_PASS" \
        --authenticationDatabase=admin \
        --db="$SOURCE_DB" \
        --out="$DUMP_DIR" \
        --gzip \
        --verbose="$VERBOSE"; then
        log_success "Дамп успешно создан: ${DUMP_DIR}/${SOURCE_DB}"
    else
        log_error "Ошибка при создании дампа"
        exit 1
    fi
else
    log_warn "DUMP_DUMP_FROM_SOURCE=false, пропускаем создание дампа"
    # Если не делаем дамп, используем существующий
    DUMP_DIR="/app/dump-data"
    if [ ! -d "$DUMP_DIR" ]; then
        log_error "Папка с дампом не найдена: $DUMP_DIR"
        exit 1
    fi
    log_info "Используем существующий дамп: $DUMP_DIR"
fi

# ============================================
# 2. ВОССТАНОВЛЕНИЕ В ПОЛУЧАТЕЛЕ
# ============================================
if [ "$LOAD_TO_DESTINATION" = "true" ]; then
    log_info "📥 Восстановление в получателе: ${DESTINATION_HOST}:${DESTINATION_PORT}/${DESTINATION_DB}"

    # Проверяем доступность получателя
    log_info "Проверка доступности получателя..."
    if mongosh \
        --host="$DESTINATION_HOST" \
        --port="$DESTINATION_PORT" \
        --username="$DESTINATION_USER" \
        --password="$DESTINATION_PASS" \
        --authenticationDatabase=admin \
        --eval "db.runCommand('ping')" \
        --quiet; then
        log_success "Получатель доступен"
    else
        log_error "Не удалось подключиться к получателю"
        exit 1
    fi

    # Восстанавливаем дамп
    if mongorestore \
        --host="$DESTINATION_HOST" \
        --port="$DESTINATION_PORT" \
        --username="$DESTINATION_USER" \
        --password="$DESTINATION_PASS" \
        --authenticationDatabase=admin \
        --db="$DESTINATION_DB" \
        --drop \
        --gzip \
        --verbose="$VERBOSE" \
        "${DUMP_DIR}/${SOURCE_DB}"; then
        log_success "Дамп успешно восстановлен в ${DESTINATION_DB}"
    else
        log_error "Ошибка при восстановлении дампа"
        exit 1
    fi
else
    log_warn "LOAD_TO_DESTINATION=false, пропускаем восстановление"
fi

# ============================================
# 3. ОЧИСТКА
# ============================================
log_info "🧹 Очистка временных файлов..."
rm -rf "$DUMP_DIR"
log_success "Очистка завершена"

# ============================================
# 4. ГОТОВО
# ============================================
log_info "==================================="
log_success "✅ ДАМП УСПЕШНО ЗАВЕРШЁН"
log_info "==================================="