// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_my_notification_unread_count200_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$GetMyNotificationUnreadCount200Response
    extends GetMyNotificationUnreadCount200Response {
  @override
  final int count;

  factory _$GetMyNotificationUnreadCount200Response([
    void Function(GetMyNotificationUnreadCount200ResponseBuilder)? updates,
  ]) => (GetMyNotificationUnreadCount200ResponseBuilder()..update(updates))
      ._build();

  _$GetMyNotificationUnreadCount200Response._({required this.count})
    : super._();
  @override
  GetMyNotificationUnreadCount200Response rebuild(
    void Function(GetMyNotificationUnreadCount200ResponseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  GetMyNotificationUnreadCount200ResponseBuilder toBuilder() =>
      GetMyNotificationUnreadCount200ResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is GetMyNotificationUnreadCount200Response &&
        count == other.count;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, count.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'GetMyNotificationUnreadCount200Response',
    )..add('count', count)).toString();
  }
}

class GetMyNotificationUnreadCount200ResponseBuilder
    implements
        Builder<
          GetMyNotificationUnreadCount200Response,
          GetMyNotificationUnreadCount200ResponseBuilder
        > {
  _$GetMyNotificationUnreadCount200Response? _$v;

  int? _count;
  int? get count => _$this._count;
  set count(int? count) => _$this._count = count;

  GetMyNotificationUnreadCount200ResponseBuilder() {
    GetMyNotificationUnreadCount200Response._defaults(this);
  }

  GetMyNotificationUnreadCount200ResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _count = $v.count;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(GetMyNotificationUnreadCount200Response other) {
    _$v = other as _$GetMyNotificationUnreadCount200Response;
  }

  @override
  void update(
    void Function(GetMyNotificationUnreadCount200ResponseBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  GetMyNotificationUnreadCount200Response build() => _build();

  _$GetMyNotificationUnreadCount200Response _build() {
    final _$result =
        _$v ??
        _$GetMyNotificationUnreadCount200Response._(
          count: BuiltValueNullFieldError.checkNotNull(
            count,
            r'GetMyNotificationUnreadCount200Response',
            'count',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
