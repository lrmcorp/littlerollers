// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mark_all_my_notifications_read200_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MarkAllMyNotificationsRead200Response
    extends MarkAllMyNotificationsRead200Response {
  @override
  final int updatedCount;
  @override
  final DateTime readAt;

  factory _$MarkAllMyNotificationsRead200Response([
    void Function(MarkAllMyNotificationsRead200ResponseBuilder)? updates,
  ]) => (MarkAllMyNotificationsRead200ResponseBuilder()..update(updates))
      ._build();

  _$MarkAllMyNotificationsRead200Response._({
    required this.updatedCount,
    required this.readAt,
  }) : super._();
  @override
  MarkAllMyNotificationsRead200Response rebuild(
    void Function(MarkAllMyNotificationsRead200ResponseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MarkAllMyNotificationsRead200ResponseBuilder toBuilder() =>
      MarkAllMyNotificationsRead200ResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MarkAllMyNotificationsRead200Response &&
        updatedCount == other.updatedCount &&
        readAt == other.readAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, updatedCount.hashCode);
    _$hash = $jc(_$hash, readAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'MarkAllMyNotificationsRead200Response',
          )
          ..add('updatedCount', updatedCount)
          ..add('readAt', readAt))
        .toString();
  }
}

class MarkAllMyNotificationsRead200ResponseBuilder
    implements
        Builder<
          MarkAllMyNotificationsRead200Response,
          MarkAllMyNotificationsRead200ResponseBuilder
        > {
  _$MarkAllMyNotificationsRead200Response? _$v;

  int? _updatedCount;
  int? get updatedCount => _$this._updatedCount;
  set updatedCount(int? updatedCount) => _$this._updatedCount = updatedCount;

  DateTime? _readAt;
  DateTime? get readAt => _$this._readAt;
  set readAt(DateTime? readAt) => _$this._readAt = readAt;

  MarkAllMyNotificationsRead200ResponseBuilder() {
    MarkAllMyNotificationsRead200Response._defaults(this);
  }

  MarkAllMyNotificationsRead200ResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _updatedCount = $v.updatedCount;
      _readAt = $v.readAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MarkAllMyNotificationsRead200Response other) {
    _$v = other as _$MarkAllMyNotificationsRead200Response;
  }

  @override
  void update(
    void Function(MarkAllMyNotificationsRead200ResponseBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  MarkAllMyNotificationsRead200Response build() => _build();

  _$MarkAllMyNotificationsRead200Response _build() {
    final _$result =
        _$v ??
        _$MarkAllMyNotificationsRead200Response._(
          updatedCount: BuiltValueNullFieldError.checkNotNull(
            updatedCount,
            r'MarkAllMyNotificationsRead200Response',
            'updatedCount',
          ),
          readAt: BuiltValueNullFieldError.checkNotNull(
            readAt,
            r'MarkAllMyNotificationsRead200Response',
            'readAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
