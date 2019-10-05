package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of ASTnode that represents
 * variable declaration statement in C program.
 */
public final class ASTDeclarationStatementC extends ASTDeclarationStatement {
	//1 variable declaration can have multiply variable declared in the same type
	private ArrayList<ASTExpressionUnit> variables;
	//They can be either initialized or uninitialized
	private ArrayList<ASTExpression> exps;
	//Variable type is necessary in variable declaration
	private ASTExpressionUnitTypes type;
	//modifiers like "const" might be used to define variables
	private ArrayList<String> modifiers;
	public ASTDeclarationStatementC() {
		super();
	}
	public ASTDeclarationStatementC(String type){
		super();
		this.type = new ASTExpressionUnitTypes(type);
		this.variables = new ArrayList<ASTExpressionUnit>();
		this.exps = new ArrayList<ASTExpression>();
		this.modifiers = new ArrayList<String>();
		this.type.addParent(this);
	}
	public void addModifier(String modifier){
		this.modifiers.add(modifier);
	}
	public void addVariableWithDeclaration(ASTExpressionUnit variable,ASTExpression exp){
		this.variables.add(variable);
		this.exps.add(exp);
		variable.addParent(this);
		exp.addParent(this);
	}
	public void addVariableWithoutDeclaration(ASTExpressionUnit variable){
		ASTExpression exp = new ASTExpression();
		exp.result = "";
		this.variables.add(variable);
		this.exps.add(exp);
		variable.addParent(this);
		exp.addParent(this);
	}
	//syntax construction
	public String toSyntax(){
		this.result = "";
		for(int i = 0;i<this.modifiers.size();i++){
			this.result += this.modifiers.get(i)+" ";
		}
		this.result += this.type.toSyntax();
		this.result += " ";
		for(int j = 0;j<this.variables.size();j++){
			this.result += this.variables.get(j).toSyntax();
			if(!this.exps.get(j).toSyntax().equals("")){
				this.result += " = "+this.exps.get(j).toSyntax();						
			}
			if(j!=this.variables.size()-1){
				this.result+=", ";
			}
		}
		this.result += ";\n";
		return this.result;
	}


}
