// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'legacy_financial_entry_actor.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LegacyFinancialEntryActor extends LegacyFinancialEntryActor {
  @override
  final String? id;
  @override
  final String? displayName;

  factory _$LegacyFinancialEntryActor([
    void Function(LegacyFinancialEntryActorBuilder)? updates,
  ]) => (LegacyFinancialEntryActorBuilder()..update(updates))._build();

  _$LegacyFinancialEntryActor._({this.id, this.displayName}) : super._();
  @override
  LegacyFinancialEntryActor rebuild(
    void Function(LegacyFinancialEntryActorBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  LegacyFinancialEntryActorBuilder toBuilder() =>
      LegacyFinancialEntryActorBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LegacyFinancialEntryActor &&
        id == other.id &&
        displayName == other.displayName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LegacyFinancialEntryActor')
          ..add('id', id)
          ..add('displayName', displayName))
        .toString();
  }
}

class LegacyFinancialEntryActorBuilder
    implements
        Builder<LegacyFinancialEntryActor, LegacyFinancialEntryActorBuilder> {
  _$LegacyFinancialEntryActor? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  LegacyFinancialEntryActorBuilder() {
    LegacyFinancialEntryActor._defaults(this);
  }

  LegacyFinancialEntryActorBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _displayName = $v.displayName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LegacyFinancialEntryActor other) {
    _$v = other as _$LegacyFinancialEntryActor;
  }

  @override
  void update(void Function(LegacyFinancialEntryActorBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LegacyFinancialEntryActor build() => _build();

  _$LegacyFinancialEntryActor _build() {
    final _$result =
        _$v ?? _$LegacyFinancialEntryActor._(id: id, displayName: displayName);
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
